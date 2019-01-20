/* eslint-env node */
const path = require('path')
const express = require('express')
const jwt = require('jsonwebtoken')

const router = new express.Router()

const User = require(path.resolve('models/User'))
const Admin = require(path.resolve('models/Admin'))

const { JWT_SECRET } = process.env

router.use('/public', require(path.resolve('router/v1/public')))
router.use('/private', require(path.resolve('router/v1/private')))

router.post('/recover-password', async (req, res) => {
  const { email } = req.body

  try {
    let user = await User.findOne({ email })
    if (!user) {
      user = await Admin.findOne({ email })
    }

    if (!user) {
      return res.status(404).json({ message: 'No user found' })
    }
    const token = jwt.sign({ email: user.email }, JWT_SECRET)

    user.token = token
  } catch (error) {
    return res.status(500).json({
      error: { message: 'Could not generate API token' },
    })
  }
})

router.use((req, res) => {
  return res.status(404).json({ message: 'Resource not found' })
})

module.exports = router
