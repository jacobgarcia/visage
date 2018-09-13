/* eslint-env node */
const express = require('express')
const path = require('path')
const winston = require('winston')
const router = new express.Router()
const crypto = require('crypto')
const mime = require('mime')
const multer = require('multer')

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, 'static/uploads'),
  filename: (req, file, callback) => {
    crypto.pseudoRandomBytes(16, (error, raw) => {
      callback(null, raw.toString('hex') + Date.now() + '.' + mime.getExtension(file.mimetype))
    })
  }
})

const upload = multer({ storage })

router.route('/images/search').post(upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: { message: 'Could not get file info' } })

  const imagePath = `/static/uploads/temp/${req.file.filename}`
  console.log(imagePath)
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
  // Stub methods using no structure
  return res.status(200).json(response)
})

router.route('/image').post((req, res) => {
  return res.status(200).json({ success: true })
})

router.route('/image/:id').delete((req, res) => {
  return res.status(200).json({ success: true })
})

module.exports = router
