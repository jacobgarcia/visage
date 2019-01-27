/* eslint-env node */
const path = require('path')
const express = require('express')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const emailVerification = require('email-verification')(mongoose)
const sesTransport = require('nodemailer-ses-transport')

const User = require(path.resolve('models/User'))
const Admin = require(path.resolve('models/Admin'))

const { JWT_SECRET,
        API_URL,
        INV_EMAIL,
        INV_PASS,
        INV_EMAIL_HOST,
        INV_USER,
        AWS_SES,
        AWS_ACCESS_KEY,
        AWS_SECRET_KEY,
      } = process.env

const router = new express.Router()


let transportOptions = {
  host: INV_EMAIL_HOST,
  from: `Do Not Reply <${INV_EMAIL}>`,
  port: 587,
  secure: false,
  auth: {
    user: INV_USER,
    pass: INV_PASS,
  },
}
if (AWS_SES === 'true') {
  transportOptions = sesTransport({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
    rateLimit: 5,
    ServiceUrl: INV_EMAIL_HOST,
  })
}


router.use('/public', require(path.resolve('router/v1/public')))
router.use('/private', require(path.resolve('router/v1/private')))

router.use((req, res) => {
  return res.status(401).json({ message: 'Forbidden' })
})

module.exports = router
