/* eslint-env node */
const express = require('express')
const path = require('path')
const winston = require('winston')
const router = new express.Router()
const multer = require('multer')
const crypto = require('crypto')
const mime = require('mime')
const base64Img = require('base64-img')
const shortid = require('shortid')

const Debug = require(path.resolve('models/Debug'))
const Exception = require(path.resolve('models/Exception'))
const Company = require(path.resolve('models/Company'))

// Storage object specs
const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, 'static/uploads'),
  filename: (req, file, callback) => {
    crypto.pseudoRandomBytes(16, (error, raw) => {
      callback(null, raw.toString('hex') + Date.now() + '.' + mime.getExtension(file.mimetype))
    })
  }
})

// Upload object specs
const upload = multer({ storage: storage }).array('photos', 3) // single file upload using this variable

router.route('/images').get((req, res) => {
  return res.status(200).json({ success: true })
})

module.exports = router
