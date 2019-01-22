/* eslint-env node */
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const express = require('express')
const winston = require('winston')
const mime = require('mime')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const request = require('request')
const aws = require('aws-sdk')
const cors = require('cors')

const User = require(path.resolve('models/User'))
const Indexing = require(path.resolve('models/Indexing'))
const Searching = require(path.resolve('models/Searching'))

const router = new express.Router()

const JWT_SECRET = process.env.JWT_SECRET
const STATIC_FOLDER = process.env.STATIC_FOLDER
const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, STATIC_FOLDER),
  filename: (req, file, callback) => {
    crypto.pseudoRandomBytes(16, (error, raw) => {
      callback(
        null,
        raw.toString('hex') +
          Date.now() +
          '.' +
          mime.getExtension(file.mimetype)
      )
    })
  },
})

const upload = multer({ storage })
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

router.route('/images/search').post(upload.single('image'), (req, res) => {
  if (!req.file) return res
      .status(400)
      .json({ error: { message: 'Could not get file info' } })
  const imagePath = `/${STATIC_FOLDER}/${req.file.filename}`

  // Call internal Flask service to process petition
  const formData = {
    image: {
      value: fs.createReadStream(process.env.PWD + imagePath),
      options: {
        filename: req.file.filename,
      },
    },
    username: req._user.username,
  }
  return request.post(
    { url: serviceUrl + '/v1/images/search', formData },
    (error, resp) => {
      if (error) {
        console.info('Could not index image', error)
        return res
          .status(500)
          .json({ error: { message: 'Could not index image' } })
      }

      const response = {
        success: resp.statusCode === 200,
        status: resp.statusCode,
        items: JSON.parse(resp.body).hits,
      }
      // After getting response from internal server service, create a new Indexing Object
      // First create the request custom Object
      const request = {
        route: req.route,
        file: req.file,
        token: req._token,
        headers: req.headers,
      }

      // Create new Indexing object
      return new Searching({
        response,
        request,
        user: req._user._id,
      }).save((error, search) => {
        if (error) {
          console.info('Could not create searching object', error)
          return res
            .status(500)
            .json({ error: { message: 'Could not create searching object' } })
        }
        // Update the user search cost
        return User.findOneAndUpdate(
          { username: req._user.username },
          { $push: { searches: search._id } }
        )
          .select('searchRates searchCost searches')
          .exec((error, user) => {
            if (error) {
              console.error('Could not update user information', error)
              return res.status(500).json({
                error: { message: 'Could not update user information' },
              })
            }
            // Get the search rate cost
            let index = 0
            for (index; index < user.searchRates.length; index += 1) {
              if (user.searches.length <= user.searchRates[index].max) break
            }
            user.searchCost += user.searchRates[index].cost
            return user.save((error) => {
              if (error) {
                console.error('Could not save user information', error)
                return res.status(500).json({
                  error: { message: 'Could not save user information' },
                })
              }
              // Then return response from internal server
              return res.status(200).json(response)
            })
          })
      })
    }
  )
})

// This method uploads the image to S3 and adds it to an toIndex array
router.route('/images/index').post(upload.single('image'), (req, res) => {
  const { id, sku } = req.body
  const image = req.file
  if (!id || !sku || !image) return res.status(400).json({ error: { message: 'Malformed Request' } })

  // Upload image to S3
  return fs.readFile(image.path, (error, data) => {
    if (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: 'Could not read uploaded file',
      })
    }

    const base64data = Buffer.from(data, 'binary')
    const key = req._user.username + '/' + image.filename
    console.log('Nombre del buket:')
    console.log(BUCKET_NAME)
    return s3.putObject(
      {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: base64data,
        ACL: 'public-read',
      },
      (error) => {
        if (error) {
          console.error(error)
          return res.status(500).json({
            success: false,
            message: 'Could not put object to S3 bucket',
          })
        }

        // Put the image to the toIndex on User
        const indexedImage = {
          name: image.filename,
          id,
          sku,
          key,
        }
        return User.findOneAndUpdate(
          { username: req._user.username },
          { $push: { toIndex: indexedImage } }
        ).exec((error) => {
          if (error) {
            console.error('Could not batch image', error)
            return res
              .status(500)
              .json({ error: { message: 'Could not batch image' } })
          }
          // Then return response from internal server
          return res
            .status(200)
            .json({ success: true, message: 'Batched image' })
        })
      }
    )
  })
})

// DEPRECATED
router.route('/images/index/now').post(upload.single('image'), (req, res) => {
  const { id, sku } = req.body
  const indexedImages = []
  const image = req.file
  if (!id || !sku || !image) return res.status(400).json({ error: { message: 'Malformed request' } })

  const url = `/${STATIC_FOLDER}/${image.filename}`
  const indexedImage = {
    url,
    name: image.filename,
  }
  indexedImages.push(indexedImage)

  // Upload image to S3
  return fs.readFile(image.path, (error, data) => {
    if (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: 'Could not read uploaded file',
      })
    }

    const base64data = Buffer.from(data, 'binary')
    return s3.putObject(
      {
        Bucket: BUCKET_NAME,
        Key: req._user.username + '/' + image.filename,
        Body: base64data,
        ACL: 'public-read',
      },
      (error) => {
        if (error) {
          console.error(error)
          return res.status(500).json({
            success: false,
            message: 'Could not put object to S3 bucket',
          })
        }

        // Call internal Flask service to process petition
        const formData = {
          id,
          sku,
          image: {
            value: fs.createReadStream(process.env.PWD + url),
            options: {
              filename: image.filename,
            },
          },
        }
        return request.post(
          { url: serviceUrl + '/v1/images/index', formData },
          (error, resp) => {
            if (error) {
              console.error('Could not index image', error)
              return res
                .status(500)
                .json({ error: { message: 'Could not index image' } })
            }

            const response = {
              success: JSON.parse(resp.body).success,
              status: 200 || resp.statusCode,
              count: 1,
              features: JSON.parse(resp.body).features,
            }

            // After getting response from internal server service, create a new Indexing Object
            // First create the request custom Object
            const request = {
              route: req.route,
              files: req.files,
              token: req._token,
              headers: req.headers,
            }

            // Create new Searching object
            return new Indexing({
              response,
              request,
              user: req._user._id,
            }).save((error, indexing) => {
              if (error) {
                return res.status(500).json({
                  error: { message: 'Could not create indexing object' },
                })
              }
              // Add Indexing object to User
              User.findOneAndUpdate(
                { username: req._user.username },
                { $push: { indexings: indexing._id, indexedImages } }
              ).exec(error)
              // Then return response from internal server
              return res.status(200).json(response)
            })
          }
        )
      }
    )
  })
})

// Delete image from the indexed images
router.route('/images/:id').delete((req, res) => {
  const { id } = req.params

  // Remove object from database
  User.findOneAndUpdate(
    { username: req._user.username },
    { $pull: { indexedImages: { name: id } } }
  ).exec((error) => {
    if (error) {
      console.info('Could not delete indexed image', error)
      return res
        .status(500)
        .json({ error: { message: 'Could not delete indexed image' } })
    }

    // Remove object from S3
    return s3.deleteObject(
      {
        Bucket: BUCKET_NAME,
        Key: req._user.username + '/' + id,
      },
      (error) => {
        if (error) {
          console.info('Could not delete indexed image from S3', error)
          return res.status(500).json({
            error: { message: 'Could not delete indexed image from S3' },
          })
        }
        // Call internal service
        const formData = {
          id,
        }
        return request.delete(
          { url: serviceUrl + '/v1/images/delete', formData },
          (error, resp) => {
            if (error) {
              console.error('Could not index image', error)
              return res
                .status(500)
                .json({ error: { message: 'Could not index image' } })
            }
            const response = {
              success: JSON.parse(resp.body).success.deleted > 0,
              status: resp.statusCode,
            }

            return res.status(200).json(response)
          }
        )
      }
    )
  })
})

module.exports = router
