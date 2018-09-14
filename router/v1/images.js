/* eslint-env node */
const express = require('express')
const path = require('path')
const winston = require('winston')
const router = new express.Router()
const crypto = require('crypto')
const mime = require('mime')
const multer = require('multer')
const jwt = require('jsonwebtoken')

const config = require(path.resolve('config'))

const User = require(path.resolve('models/User'))
const Indexing = require(path.resolve('models/Indexing'))

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, 'static/uploads'),
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
  return new Indexing({
    response,
    request,
    user: req._user._id
  }).save(error => {
    if (error) {
      console.log('Could not create indexing object', error)
      return res.status(500).json({ error: { message: 'Could not create indexing object' } })
    }
    // Then return response from internal server
    return res.status(200).json(response)
  })
})

router.route('/image').post((req, res) => {
  return res.status(200).json({ success: true })
})

router.route('/image/:id').delete((req, res) => {
  return res.status(200).json({ success: true })
})

module.exports = router
