/* eslint-env node */
const fs = require('fs')
const { promisify } = require('util')

const path = require('path')
const express = require('express')
const winston = require('winston')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const rp = require('request-promise')
const aws = require('aws-sdk')
const cors = require('cors')
const base64Img = require('base64-img')
const shortid = require('shortid')
const { check, validationResult } = require('express-validator')

const decodeImage = promisify(base64Img.img)

const User = require(path.resolve('models/User'))
const Searching = require(path.resolve('models/Searching'))
const router = new express.Router()

const JWT_SECRET = process.env.JWT_SECRET
const STATIC_FOLDER = process.env.STATIC_FOLDER
const ENGINE_THRESHOLD = process.env.ENGINE_THRESHOLD

const serviceUrl = process.env.ENGINE_URL
const BUCKET_NAME = process.env.BUCKET_NAME

aws.config.update({
  region: 'us-east-1',
})

const { AWS_ACCESS_KEY, AWS_SECRET_KEY } = process.env

aws.config.update({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
})

const s3 = new aws.S3()

/*
  C O R S   S T U F F
*/
router.options('*', cors())
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

// Authorization middleware. Endpoints from here now will be protected by Bearer Token
router.use((req, res, next) => {
  const bearer = req.headers.authorization || 'Bearer '
  const token = bearer.split(' ')[1]

  if (!token) return res
      .status(401)
      .send({ error: { message: 'No bearer token provided' } })
  return jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      winston.error('Failed to authenticate token', err, token)
      return res.status(401).json({ error: { message: 'Invalid API token' } })
    }
    req._user = decoded
    return User.findOne({ username: req._user.username }).exec(
      (error, user) => {
        if (error || !user) {
          return res.status(401).json({
            error: { message: 'Could not found a token for a valid user' },
          })
        }
        if (!user.apiKey.active) return res.status(401).json({
            success: false,
            message: 'Your API token is inactive. Re-issue a new token',
          })
        req._token = token
        return next()
      }
    )
  })
})

// Search an image using the engine
router.route('/images/search').post([
    check('image')
      .isBase64()
      .withMessage('Image is not base64'),
  ], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map((error) => {
          Reflect.deleteProperty(error, 'value')
          return error
        }),
      })
    }
    const { image } = req.body
    const filename = `${shortid.generate()}${Date.now()}`
    const path = await decodeImage(`data:image/png;base64,${image}`, STATIC_FOLDER, filename)

    // Call internal Flask service to process petition
    const formData = {
      image: {
        value: fs.createReadStream(`${process.env.PWD}/${path}`),
        options: {
          filename,
        },
      },
      username: req._user.username,
    }
    const resp = await rp.post({
      url: serviceUrl + '/v1/images/search',
      formData,
      timeout: 200000,
      json: true,
    })
    // Image items
    const items = []

    resp.hits.map((item) => {
      item.im_src = `https://${BUCKET_NAME}.s3.amazonaws.com/${
        req._user.username
      }${item.im_src.substr(item.im_src.lastIndexOf('/'))}`
      item.score > ENGINE_THRESHOLD ? items.push(item) : {}
    })

    // Build the response object
    const response = {
      success: items.length > 0,
      status: items.length > 0 ? 200 : 404,
      items: items,
    }

    // After getting response from internal server service, create a new Searching Object
    // First create the request custom Object
    const request = {
      route: req.route,
      file: req.file,
      token: req._token,
      headers: req.headers,
    }

    // Create new Searching object
    const search = await new Searching({
      response,
      request,
      user: req._user._id,
    }).save()

    // Update the user search cost
    const user = await User.findOneAndUpdate(
      { username: req._user.username },
      { $push: { searches: search._id } }
    )
      .select('searchRates searchCost searches')
      .exec()

    // Get the search rate cost
    let index = 0
    for (index; index < user.searchRates.length; index += 1) {
      if (user.searches.length <= user.searchRates[index].max) break
    }
    user.searchCost += user.searchRates[index].cost
    await user.save()
    // Then return response from internal server
    return res.status(200).json(response)
  } catch (error) {
    if (error instanceof multer.MulterError) {
      return res
        .status(500)
        .json({ error: { message: 'Error uploading file', error } })
    }
    console.error('Could not search image', error)
    return res
      .status(500)
      .json({ message: 'Could not search image', error: error.toString() })
  }
})

// This method uploads the image to S3 and adds it to an toIndex array
router.route('/images/index').post(
  [
    check('id').isNumeric(),
    check('sku').exists(),
    check('image')
      .isBase64()
      .withMessage('Image is not base64'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array().map((error) => {
            Reflect.deleteProperty(error, 'value')
            return error
          }),
        })
      }

      const { id, sku, image } = req.body
      const filename = `${shortid.generate()}${Date.now()}`
      // Upload image to S3
      const key = `${req._user.username}/${filename}.jpeg`
      const buffer = Buffer.from(
        image.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
      )

      await s3
        .putObject({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: buffer,
          ACL: 'public-read',
          ContentEncoding: 'base64',
          ContentType: 'image/jpeg',
        })
        .promise()
      // Put the image to the toIndex on User
      const indexedImage = {
        name: filename,
        id,
        sku,
        key,
      }
      await User.findOneAndUpdate(
        { username: req._user.username },
        { $push: { toIndex: indexedImage } }
      ).exec()

      // Then return response from internal server
      return res.status(200).json({ success: true, message: 'Batched image' })
    } catch (error) {
      console.error('Could not batch image', error)
      return res
        .status(500)
        .json({ error: { message: 'Could not batch image' } })
    }
  }
)

// Delete image from the indexed images
router.route('/images/:id').delete(async (req, res) => {
  try {
    const { id } = req.params

    // Remove object from database
    await User.findOneAndUpdate(
      { username: req._user.username },
      { $pull: { indexedImages: { name: id } } }
    ).exec()

    // Remove object from S3
    await s3.deleteObject({
      Bucket: BUCKET_NAME,
      Key: req._user.username + '/' + id,
    })

    // Call internal service to remove indexed image on engine
    const formData = {
      id,
    }
    const resp = await rp.delete({
      url: serviceUrl + '/v1/images/delete',
      formData,
      timeout: 200000,
    })

    const response = {
      success: JSON.parse(resp.body).success.deleted > 0,
      status: resp.statusCode,
    }

    return res.status(200).json(response)
  } catch (error) {
    console.error('Could not delete indexed image', error)
    if (error.code) {
      if (error.code === 'ETIMEDOUT') {
        console.error('Engine Timeout', error)
        return res.status(500).json({ error: { message: 'Engine timeout' } })
      }
      if (error.code === 'ECONNREFUSED') {
        console.error('Engine ECONNREFUSED', error)
        return res
          .status(500)
          .json({ error: { message: 'Engine connection refused' } })
      }
    }
    return res
      .status(500)
      .json({ message: 'Could not delete indexed image', error })
  }
})

module.exports = router
