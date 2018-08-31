/* eslint-env node */
const express = require('express')
const path = require('path')
const winston = require('winston')
const router = new express.Router()
const crypto = require('crypto')
const mime = require('mime')

router.route('/images').get((req, res) => {
  return res.status(200).json({ success: true })
})

module.exports = router
