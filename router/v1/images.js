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

router.route('/token/generate').post((req, res) => {
  // const { _id } = req._user
  const username = 'mariogarcia'
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
      if (error) {
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
  const response = {
    success: true,
    status: 200,
    items: [
      {
        id: '123',
        sku: 01120000,
        similarity: 72
      },
      {
        id: '101',
        sku: 02210000,
        similarity: 66
      },
      {
        id: '98',
        sku: 09120000,
        similarity: 62
      },
      {
        id: '204',
        sku: 01120002,
        similarity: 60
      }
    ]
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

router.route('/images/index').post(upload.array('images'), (req, res) => {
  if (!req.files) return res.status(400).json({ error: { message: 'Could not get files info' } })
  const indexedImages = []

  req.files.map(photo => {
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
          Bucket: 'visualsearchqbo',
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
  })

  // Call internal Flask service to process petition
  const response = {
    success: true,
    status: 200,
    count: 13
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
        Bucket: 'visualsearchqbo',
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
  const response = {
    success: true,
    status: 200
  }

  return res.status(200).json(response)
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

router.route('/stats/users/purchases').get((req, res) => {
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

module.exports = router
