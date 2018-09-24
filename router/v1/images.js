/* eslint-env node */
const fs = require('fs')
const express = require('express')
const path = require('path')
const winston = require('winston')
const router = new express.Router()
const crypto = require('crypto')
const mime = require('mime')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const request = require('request')
const AWS = require('aws-sdk')
const s3 = new AWS.S3()

const config = require(path.resolve('config'))

const User = require(path.resolve('models/User'))
const Indexing = require(path.resolve('models/Indexing'))
const Searching = require(path.resolve('models/Searching'))

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, 'static/uploads/temp'),
  filename: (req, file, callback) => {
    crypto.pseudoRandomBytes(16, (error, raw) => {
      callback(null, raw.toString('hex') + Date.now() + '.' + mime.getExtension(file.mimetype))
    })
  }
})

const upload = multer({ storage })
const serviceUrl = 'http://localhost:5000'

router.route('/token/generate/:username').post((req, res) => {
  const { username } = req.params
  User.findOne({ username }).exec((error, user) => {
    if (error || !user) {
      console.log('Failed to get user information', error)
      return res.status(500).json({ error: { message: 'Could not fetch user information' } })
    }
    const value = jwt.sign(
      { _id: user._id, email: user.email, username: user.username },
      config.secret
    )
    const apiKey = {
      value,
      active: true
    }
    user.apiKey = apiKey
    user.save(error => {
      if (error) {
        console.log('Could not save api token ', error)
        return res.status(500).json({ error: { message: 'Could not generate API token' } })
      }
      return res.status(200).json({ success: true, apiKey })
    })
  })
})

// TODO: Validate with hasAccess
router.route('/token/revoke/:username').post((req, res) => {
  const { username } = req.params
  User.findOne({ username }).exec((error, user) => {
    if (error) {
      console.error('Could not find user', error)
      return res.status(500).json({ error: { message: 'Could not find user' } })
    }
    user.apiKey.active = false
    user.save(error => {
      if (error) {
        console.error('Could not update user information', error)
        return res.status(500).json({ error: { message: 'Could not update user information' } })
      }
    })
    return res
      .status(200)
      .json({ success: true, message: 'Revoked API token for user ' + username })
  })
})

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

router.use((req, res, next) => {
  const bearer = req.headers.authorization || 'Bearer '
  const token = bearer.split(' ')[1]

  if (!token) return res.status(401).send({ error: { message: 'No bearer token provided' } })
  return jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      winston.error('Failed to authenticate token', err, token)
      return res.status(401).json({ error: { message: 'Invalid API token' } })
    }
    req._user = decoded
    User.findOne({ username: req._user.username }).exec((error, user) => {
      if (error || !user) {
        console.log('Could not found a token for a valid user')
        return res
          .status(500)
          .json({ error: { message: 'Could not found a token for a valid user' } })
      }
      if (!user.apiKey.active)
        return res
          .status(401)
          .json({ success: false, message: 'Your API token is inactive. Re-issue a new token' })
      req._token = token
      return next()
    })
  })
})

router.route('/images/search').post(upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: { message: 'Could not get file info' } })
  const imagePath = `/static/uploads/temp/${req.file.filename}`

  // Call internal Flask service to process petition
  const formData = {
    image: {
      value: fs.createReadStream(process.env.PWD + imagePath),
      options: {
        filename: req.file.filename
      }
    }
  }
  request.post({ url: serviceUrl + '/v1/images/search', formData }, (error, resp) => {
    if (error) {
      console.log('Could not index image', error)
      return res.status(500).json({ error: { message: 'Could not index image' } })
    }

    const response = {
      success: resp.statusCode === 200 ? true : false,
      status: resp.statusCode,
      items: JSON.parse(resp.body).hits
    }
    // After getting response from internal server service, create a new Indexing Object
    // First create the request custom Object
    const request = {
      route: req.route,
      file: req.file,
      token: req._token,
      headers: req.headers
    }

    // Create new Indexing object
    return new Searching({
      response,
      request,
      user: req._user._id
    }).save((error, search) => {
      if (error) {
        console.log('Could not create searching object', error)
        return res.status(500).json({ error: { message: 'Could not create searching object' } })
      }
      // Add Indexing object to User
      User.findOneAndUpdate(
        { username: req._user.username },
        { $push: { searches: search._id } }
      ).exec(error)
      // Then return response from internal server
      return res.status(200).json(response)
    })
  })
})

router.route('/images/index').post(upload.single('image'), (req, res) => {
  const { id, sku } = req.body
  const indexedImages = []
  const photo = req.file
  if (!id || !sku) return res.status(400).json({ error: { message: 'Malformed request' } })
  if (!req.file) return res.status(400).json({ error: { message: 'Could not get files info' } })
  const url = `/static/uploads/temp/${photo.filename}`

  const indexedImage = {
    url,
    name: photo.filename
  }
  indexedImages.push(indexedImage)

  // Upload image to S3
  fs.readFile(photo.path, (error, data) => {
    if (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: 'Could not read uploaded file'
      })
    }

    const base64data = Buffer.from(data, 'binary')
    return s3.putObject(
      {
        Bucket: 'visual-search-qbo',
        Key: req._user.username + '/' + photo.filename,
        Body: base64data,
        ACL: 'public-read'
      },
      error => {
        if (error) {
          console.error(error)
          return res.status(500).json({
            success: false,
            message: 'Could not put object to S3 bucket'
          })
        }
      }
    )
  })

  // Call internal Flask service to process petition
  const formData = {
    id,
    sku,
    image: {
      value: fs.createReadStream(process.env.PWD + url),
      options: {
        filename: photo.filename
      }
    }
  }
  request.post({ url: serviceUrl + '/v1/images/index', formData }, (error, resp) => {
    if (error) {
      console.error('Could not index image', error)
      return res.status(500).json({ error: { message: 'Could not index image' } })
    }

    const response = {
      success: JSON.parse(resp.body).success,
      status: 200 || resp.statusCode,
      count: 1,
      features: JSON.parse(resp.body).features
    }

    // After getting response from internal server service, create a new Indexing Object
    // First create the request custom Object
    const request = {
      route: req.route,
      files: req.files,
      token: req._token,
      headers: req.headers
    }

    // Create new Searching object
    return new Indexing({
      response,
      request,
      user: req._user._id
    }).save((error, indexing) => {
      if (error) {
        console.log('Could not create indexing object', error)
        return res.status(500).json({ error: { message: 'Could not create indexing object' } })
      }
      // Add Indexing object to User
      User.findOneAndUpdate(
        { username: req._user.username },
        { $push: { indexings: indexing._id, indexedImages } }
      ).exec(error)
      // Then return response from internal server
      return res.status(200).json(response)
    })
  })
})

router.route('/images/:id').delete((req, res) => {
  const { id } = req.params

  // Remove object from database
  User.findOneAndUpdate(
    { username: req._user.username },
    { $pull: { indexedImages: { name: id } } }
  ).exec(error => {
    if (error) {
      console.log('Could not delete indexed image', error)
      return res.status(500).json({ error: { message: 'Could not delete indexed image' } })
    }

    // Remove object from S3
    s3.deleteObject(
      {
        Bucket: 'visual-search-qbo',
        Key: req._user.username + '/' + id
      },
      error => {
        if (error) {
          console.log('Could not delete indexed image from S3', error)
          return res
            .status(500)
            .json({ error: { message: 'Could not delete indexed image from S3' } })
        }
      }
    )
  })
  // Call internal service
  const formData = {
    id
  }
  request.delete({ url: serviceUrl + '/v1/images/delete', formData }, (error, resp) => {
    if (error) {
      console.error('Could not index image', error)
      return res.status(500).json({ error: { message: 'Could not index image' } })
    }
    const response = {
      success: JSON.parse(resp.body).success.deleted > 0,
      status: resp.statusCode
    }

    return res.status(200).json(response)
  })
})

//ENDPOINTS FOR ADMIN PANEL
router.route('/stats/petitions').get((req, res) => {
  Indexing.find({})
    .select('id')
    .exec((error, indexings) => {
      if (error) {
        console.log('Could not fetch indexings', error)
        return res.status(500).json({ error: { message: 'Could not fetch indexings' } })
      }
      Searching.find({})
        .select('id')
        .exec((error, searchings) => {
          if (error) {
            console.log('Could not fetch searches', error)
            return res.status(500).json({ error: { message: 'Could not fetch searches' } })
          }
          const petitions = {
            indexings: indexings.length,
            searches: searchings.length,
            total: indexings.length + searchings.length
          }
          return res.status(200).json({ petitions })
        })
    })
})

// TODO: Add hasAccess flag
router.route('/stats/users/billing').get((req, res) => {
  // Find all users
  User.find({})
    .lean()
    .select('searches indexings searchRates indexRates username email company')
    .exec((error, users) => {
      if (error) {
        console.log('Could not fetch users', error)
        return res.status(500).json({ error: { message: 'Could not fetch users' } })
      }

      users.map(user => {
        let indexingCost = 0,
          searchingCost = 0

        const indexing = user.indexings.length,
          searching = user.searches.length

        user.indexRates.map(rate => {
          if (indexing >= rate.min && indexing <= rate.max) {
            indexingCost += indexing * rate.cost
          } else {
            indexing -= rate.max
            indexingCost += indexing * rate.cost
          }
        })

        user.searchRates.map(rate => {
          if (searching >= rate.min && searching <= rate.max) {
            searchingCost += searching * rate.cost
          } else {
            searching -= rate.max
            searchingCost += searching * rate.cost
          }
        })

        user.indexingCost = indexingCost
        user.searchingCost = searchingCost
        user.billing = indexingCost + searchingCost
        return user
      })

      // Finally sort users by billing
      users.sort(($0, $1) => {
        $0.billing - $1.billing
      })
      return res.status(200).json({ users })
    })
})

router.route('/users').get((req, res) => {
  User.find({})
    .select('username fullname company email indexStatus')
    .exec((error, users) => {
      if (error) {
        console.log('Could not fetch users', error)
        return res.status(500).json({ error: { message: 'Could not fetch users' } })
      }

      return res.status(200).json({ users })
    })
})

module.exports = router
