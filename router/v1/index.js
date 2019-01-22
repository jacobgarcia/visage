/* eslint-env node */
const path = require('path')
const express = require('express')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const emailVerification = require('email-verification')(mongoose)

const User = require(path.resolve('models/User'))
const Admin = require(path.resolve('models/Admin'))

const { JWT_SECRET, API_URL, INV_EMAIL, INV_PASS } = process.env

const router = new express.Router()

router.use('/public', require(path.resolve('router/v1/public')))
router.use('/private', require(path.resolve('router/v1/private')))
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body

  try {
    const decoded = await jwt.verify(token, JWT_SECRET)

    let user = await User.findOne({ email: decoded.email })
    if (!user) {
      user = await Admin.findOne({ email: decoded.email })
    }

    if (!user || user.token !== token) {
      return res.status(400).json({ message: 'Invalid reset token' })
    }

    user.password = await bcrypt.hash(`${password}${JWT_SECRET}`, 10)
    user.token = null
    await user.save()

    const sessionToken = jwt.sign(
      {
        _id: user._id,
        acc: user.access,
        cmp: user.company,
      },
      JWT_SECRET
    )

    const userObject = user.toObject()

    return res.status(200).json({
      token: sessionToken,
      user: {
        _id: userObject._id,
        name: userObject.name || 'User',
        access: userObject.access,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
})

router.post('/forgot', async (req, res) => {
  const { email } = req.body

  try {
    let user = await User.findOne({ email })

    if (!user) {
      user = await Admin.findOne({ email })
    }

    if (!user) {
      return res.status(200).json({ message: 'Email sent' })
    }

    const token = jwt.sign({ email: user.email }, JWT_SECRET)

    user.token = token
    await user.save()

    await emailVerification.sendRecoveryEmail(
      user.email,
      API_URL + `/reset?token=${token}`,
      {
        host: 'smtp.zoho.com',
        from: 'Nure <no-reply@nure.mx>',
        port: 587,
        secure: false, // true for 465, false for other ports
        subject: 'Recupera tu contraseña',
        html: `
          <h1>Recupera tu contraseña</h1>
          <p>
            Recupera tu contraseña haciendo click en el siguiente <a href="${API_URL}/reset-password?token=${token}">link</a>
          </p>`,
        text: `Recupera tu contraseña haciendo click en el siguiente link ${API_URL}/reset-password?token=${token}`,
        auth: {
          user: INV_EMAIL,
          pass: INV_PASS,
        },
      }
    )

    return res.status(200).json({ message: 'Email sent' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      error: { message: 'Could not generate API token' },
    })
  }
})

router.use((req, res) => {
  return res.status(401).json({ message: 'Forbidden' })
})

module.exports = router
