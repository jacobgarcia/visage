/* eslint-env node */
const express = require('express')
const path = require('path')
const winston = require('winston')
const router = new express.Router()
const crypto = require('crypto')
const mime = require('mime')

router
  .route('/images')
  .get((req, res) => {
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
  .post((req, res) => {
    return res.status(200).json({ success: true })
  })

router.route('/image/:id').delete((req, res) => {
  return res.status(200).json({ success: true })
})

module.exports = router
