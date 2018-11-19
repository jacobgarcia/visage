/* eslint-env node */
const express = require('express')
const winston = require('winston')
const router = new express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const path = require('path')
const mongoose = require('mongoose')
const nev = require('email-verification')(mongoose)

const User = require(path.resolve('models/User'))
const Guest = require(path.resolve('models/Guest'))

const config = require(path.resolve('config'))

URL = 'dash'

nev.configure({
  verificationURL: `https://demo.kawlantid.com/signup/${URL}`,
  // mongo configuration
  persistentUserModel: User,
  tempUserModel: Guest,
  expirationTime: 86400, // 24 hour expiration
  URLFieldName: 'invitation',

  transportOptions: {
    service: 'Gmail',
    auth: {
      user: 'ingenieria@connus.mx',
      pass: 'kawlantcloud'
    }
  },
  verifyMailOptions: {
    from: 'Do Not Reply <ingenieria@connus.mx>',
    subject: 'Confirm your account',
    html: `<p>Please verify your account by clicking <a href="${URL}">this link</a>. If you are unable to do so, copy and paste the following link into your browser:</p><p>${URL}</p>`,
    text: `Please verify your account by clicking the following link, or by copying and pasting it into your browser: ${URL}`
  },
  shouldSendConfirmation: true,
  confirmMailOptions: {
    from: 'Do Not Reply <ingenieria@connus.mx>',
    subject: 'Successfully verified!',
    html: '<p>Your account has been successfully verified.</p>',
    text: 'Your account has been successfully verified.'
  },

  hashingFunction: null
}, (error, options) => {
  winston.error({ error })
})

router.route('/users/invite').post((req, res) => {
  const { email } = req.body

  const guest = new User({
    email,
    host: req._user
  })
  nev.createTempUser(guest, (err, existingPersistentUser, newTempUser) => {
    if (err) {
      winston.error({ err })
      return res.status(500).json({ err })
    }
    if (existingPersistentUser) return res.status(409).json({ error: 'User already registered' })

    if (newTempUser) {
      const URL = newTempUser[nev.options.URLFieldName]
      nev.sendVerificationEmail(email, URL, error => {
        if (error) return res.status(500).json({ error })
        return res.status(200).json({ message: 'Invitation successfully sent' })
      })
    }
    // user already have been invited
    return res.status(409).json({ error: 'User already invited' })
  })
})

router.post('/signup/:invitation', (req, res) => {
  const { invitation } = req.params
  const { email, password, username, fullName } = req.body
  if (!invitation) return res.status(401).json({ message: 'No invitation token provided' })
  Guest.findOne({ invitation }).exec((error, guest) => {
    if (error) {
      winston.error({ error })
      return res.status(500).json({ error })
    }
    if (!guest)
      return res.status(401).json({
        message: 'Invalid invitation. Please ask your administrator to send you an invitation again'
      })
    if (guest.email !== email)
      return res.status(401).json({
        message: 'Invalid invitation. Please ask your administrator to send your invitation again'
      })

    guest.fullName = fullName
    guest.username = username

    guest.password = bcrypt.hash(password + config.secret)
    guest.save(() => {
      nev.confirmTempUser(invitationToken, (error, user) => {
        if (error) {
          winston.error(error)
          return res.status(500).json({ error })
        }
        if (!user)
          return res.status(500).json({ message: 'Could not send create user information' })

        nev.sendConfirmationEmail(user.email, (error, info) => {
          if (error) {
            winston.error(error)
            return res.status(404).json({ message: 'Sending confirmation email FAILED' })
          }

          const token = jwt.sign(
            {
              _id: user._id,
              acc: user.access,
              cmp: user.company
            },
            config.secret
          )

          const user = user.toObject()

          return res.status(200).json({
            token,
            user: {
              _id: user._id,
              name: user.name || 'User',
              surname: user.surname,
              access: user.access
            },
            info
          })
        })
      })
    })
  })
})

router.route('/authenticate').post((req, res) => {
  const { email, password } = req.body
  User.findOne({ email })
    .lean()
    .then(user => {
      if (user === null) {
        winston.info('Failed to authenticate user email')
        return res.status(400).json({ message: 'Authentication failed. Wrong user or password.' })
      }
      return bcrypt
        .compare(`${password}${config.secret}`, user.password)
        .then(result => {
          const token = jwt.sign(
            {
              _id: user._id,
              acc: user.access,
              cmp: user.company
            },
            config.secret
          )
          const { _id, fullName: name, surname, access, defaultPosition } = user
          if (result)
            return res.status(200).json({
              token,
              user: {
                _id,
                name,
                surname,
                access,
                defaultPosition
              }
            })

          return res.status(401).json({ message: 'Authentication failed. Wrong user or password' })
        })
        .catch(error => {
          winston.info('Failed to authenticate user password', error)
          return res.status(401).json({ message: 'Authentication failed. Wrong user or password' })
        })
    })
    .catch(error => {
      winston.error({ error })
      return res.status(500).json({ error }) // Causes an error for cannot set headers after sent
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

  if (!token) {
    return res.status(401).send({ error: { message: 'No bearer token provided' } })
  }

  return jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      winston.error('Failed to authenticate token', err, token)
      return res.status(401).json({ error: { message: 'Failed to authenticate  bearer token' } })
    }

    req._user = decoded
    req._token = token
    return next()
  })
})

module.exports = router
