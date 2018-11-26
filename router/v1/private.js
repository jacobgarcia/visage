/* eslint-env node */
const fs = require('fs')
const path = require('path')
const express = require('express')
const winston = require('winston')
const router = new express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const nev = require('email-verification')(mongoose)
const rp = require('request-promise')
const Json2csvParser = require('json2csv').Parser

const User = require(path.resolve('models/User'))
const Guest = require(path.resolve('models/Guest'))
const Admin = require(path.resolve('models/Admin'))
const Indexing = require(path.resolve('models/Indexing'))
const Searching = require(path.resolve('models/Searching'))

const config = require(path.resolve('config'))

const serviceUrl = 'https://admin.vs-01-dev.qbo.tech'

function getUserData(data) {
  return { ...data.toObject(), access: data.services ? 'admin' : 'user' }
}

const fields = [
  {
    label: 'Username',
    value: 'username',
  },
  {
    label: 'Name',
    value: 'name',
  },
  {
    label: 'Surname',
    value: 'surname',
  },
  {
    label: 'Company',
    value: 'company',
  },
  {
    label: 'Email',
    value: 'email',
  },
]

const adminFields = [
  {
    label: 'Username',
    value: 'username',
  },
  {
    label: 'Name',
    value: 'name',
  },
  {
    label: 'Surname',
    value: 'surname',
  },
  {
    label: 'Company',
    value: 'company',
  },
  {
    label: 'Email',
    value: 'email',
  },
]

nev.configure(
  {
    verificationURL: `http://localhost:8080/signup/${URL}`,
    // mongo configuration
    persistentUserModel: User,
    tempUserModel: Guest,
    expirationTime: 86400, // 24 hour expiration
    URLFieldName: 'invitation',

    transportOptions: {
      service: 'Gmail',
      auth: {
        user: 'ingenieria@connus.mx',
        pass: 'kawlantcloud',
      },
    },
    verifyMailOptions: {
      from: 'Do Not Reply <ingenieria@connus.mx>',
      subject: 'Confirm your account',
      html: `<p>Please verify your account by clicking <a href="${URL}">this link</a>. If you are unable to do so, copy and paste the following link into your browser:</p><p>${URL}</p>`,
      text: `Please verify your account by clicking the following link, or by copying and pasting it into your browser: ${URL}`,
    },
    shouldSendConfirmation: true,
    confirmMailOptions: {
      from: 'Do Not Reply <ingenieria@connus.mx>',
      subject: 'Successfully verified!',
      html: '<p>Your account has been successfully verified.</p>',
      text: 'Your account has been successfully verified.',
    },
    hashingFunction: null,
  },
  (error) => {
    winston.error({ error })
  }
)

// TODO: Only admins can trigger this action. Left here for RAD
router.route('/users/token/:username').post((req, res) => {
  const { username } = req.params
  User.findOne({ username }).exec((error, user) => {
    if (error || !user) {
      console.info('Failed to get user information', error)
      return res.status(500).json({ error: { message: 'Could not fetch user information' } })
    }
    const value = jwt.sign(
      { _id: user._id, email: user.email, username: user.username },
      config.secret
    )
    const apiKey = {
      value,
      active: true,
    }
    user.apiKey = apiKey
    return user.save((error) => {
      if (error) {
        console.info('Could not save api token ', error)
        return res.status(500).json({ error: { message: 'Could not generate API token' } })
      }
      return res.status(200).json({ success: true, apiKey })
    })
  })
})

// TODO: Only admins can trigger this action. Left here for RAD
router.route('/users/token/:username').patch((req, res) => {
  const { username } = req.params
  User.findOne({ username }).exec((error, user) => {
    if (error) {
      console.error('Could not find user', error)
      return res.status(500).json({ error: { message: 'Could not find user' } })
    }
    user.apiKey.active = false
    return user.save((error) => {
      if (error) {
        console.error('Could not update user information', error)
        return res.status(500).json({ error: { message: 'Could not update user information' } })
      }
      return res.status(200).json({
        success: true,
        message: `Revoked API token for user ${username}`,
      })
    })
  })
})

// Index images getting objects from S3
router.route('/images/index/:username').post((req, res) => {
  // Specific username to index images at the moment of petition
  const { username } = req.params
  let count = 0
  User.findOneAndUpdate({ username }, { $set: { isIndexing: true } }).exec((error, user) => {
    if (error) {
      console.error('Could not get user information', error)
      return res.status(500).json({ error: { message: 'Could not get user information' } })
    }
    if (!user) return res.status(404).json({ error: { message: 'User has not been found' } })
    if (user.toIndex.length === 0) return res.status(200).json({ success: false, message: 'Nothing to index' })
    // Iterate over the batch of images
    const promises = user.toIndex.map(async (image) => {
      const { id, sku, key } = image
      const indexedImages = []
      indexedImages.push(image)

      // Create formData object to send to the service
      const formData = {
        id,
        sku,
        image: {
          value: fs.createReadStream(
            process.env.PWD + '/static/uploads/temp/' + key.substr(key.lastIndexOf('/') + 1)
          ),
          options: {
            filename: image.filename,
          },
        },
      }

      // Call internal Flask service to process petition

      await rp
        .post({
          url: serviceUrl + '/v1/images/index',
          formData,
          resolveWithFullResponse: true,
        })
        .then((resp) => {
          console.info(resp.statusCode, resp.body)
          if (resp.statusCode === 200) count += 1
          // Build response object
          const response = {
            success: JSON.parse(resp.body).success,
            status: resp.statusCode,
            features: JSON.parse(resp.body).features,
          }

          // After getting response from internal server service, create a new Indexing Object
          // First create the request custom Object
          const request = {
            route: req.route,
            files: req.files,
            token: req._token,
            headers: req.headers,
          }

          // Create new Searching object
          new Indexing({
            response,
            request,
            user,
          }).save((error, indexing) => {
            if (error) {
              console.info('Could not create indexing object', error)
              return
            }
            // Add Indexing object to User and move toIndex object to IndexedImages
            // Remove item form the toIndex batch
            User.findOneAndUpdate(
              { username },
              {
                $push: { indexings: indexing._id, indexedImages },
                $pull: { toIndex: image },
              }
            ).exec((error) => {
              if (error) {
                console.error('Could not update user information')
              }
            })
          })
        })
        .catch((error) => {
          if (error) {
            console.error('Could not index image', error)
          }
        })
    })
    return Promise.all(promises).then(() => {
      User.findOneAndUpdate({ username }, { $set: { isIndexing: false } }).exec((error, user) => {
        if (error) {
          console.error('Could not update user information')
          return res.status(500).json({
            error: { message: 'Could not update user information' },
          })
        }
        return res.status(200).json({ success: true, count, user })
      })
    })
  })
})

// Statistics endpoint for dashboard
router.route('/stats/requests').get((req, res) => {
  Indexing.find({})
    .select('id')
    .exec((error, indexings) => {
      if (error) {
        console.info('Could not fetch indexings', error)
        return res.status(500).json({ error: { message: 'Could not fetch indexings' } })
      }
      return Searching.find({})
        .select('id')
        .exec((error, searchings) => {
          if (error) {
            console.info('Could not fetch searches', error)
            return res.status(500).json({ error: { message: 'Could not fetch searches' } })
          }
          const requests = {
            indexings: indexings.length,
            searches: searchings.length,
            total: indexings.length + searchings.length,
          }
          return res.status(200).json({ requests })
        })
    })
})

// Statistics endpoint for dashboard
router.route('/stats/users/billing').get((req, res) => {
  // Find all users
  User.find({})
    .lean()
    .select('searches indexings searchRates indexRates username email company')
    .exec((error, users) => {
      if (error) {
        console.info('Could not fetch users', error)
        return res.status(500).json({ error: { message: 'Could not fetch users' } })
      }

      users.map((user) => {
        let indexingCost = 0,
          searchingCost = 0

        let indexing = user.indexings.length,
          searching = user.searches.length

        user.indexRates.map((rate) => {
          if (indexing >= rate.min && indexing <= rate.max) {
            indexingCost += indexing * rate.cost
          } else {
            indexing -= rate.max
            indexingCost += indexing * rate.cost
          }
        })

        user.searchRates.map((rate) => {
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

router.route('/users/invite').post((req, res) => {
  const { email } = req.body
  const guest = new User({
    email,
    host: req._user,
  })
  nev.createTempUser(
    guest,
    (error, existingPersistentUser, newTempUser) => {
      if (error) {
        winston.error({ error })
        return res.status(500).json({ error })
      }
      if (existingPersistentUser) return res.status(409).json({ error: 'User already registered' })

      if (newTempUser) {
        const URL = newTempUser[nev.options.URLFieldName]
        return nev.sendVerificationEmail(email, URL, (error) => {
          if (error) return res.status(500).json({ error })
          return res.status(200).json({ message: 'Invitation successfully sent' })
        })
      }
      // user already have been invited
      return res.status(409).json({ error: 'User already invited' })
    },
    (error) => {
      winston.error({ error })
    }
  )
})

router.route('/admin/invite').post((req, res) => {
  const { email, services } = req.body
  const guest = new Admin({
    email,
    services,
    host: req._user,
  })
  nev.createTempUser(
    guest,
    (error, existingPersistentUser, newTempUser) => {
      if (error) {
        winston.error({ error })
        return res.status(500).json({ error })
      }
      if (existingPersistentUser) return res.status(409).json({ error: 'Admin already registered' })
      if (newTempUser) {
        const URL = newTempUser[nev.options.URLFieldName]
        return nev.sendVerificationEmail(email, URL, (error) => {
          if (error) return res.status(500).json({ error })
          return res.status(200).json({ message: 'Invitation successfully sent' })
        })
      }
      // user already have been invited
      return res.status(409).json({ error: 'Admin already invited' })
    },
    (error) => {
      winston.error({ error })
    }
  )
})

router.post('/signup/:invitation', (req, res) => {
  const { invitation } = req.params
  const { email, password, username, name } = req.body
  if (!invitation) return res.status(401).json({ message: 'No invitation token provided' })
  return Guest.findOne({ invitation }).exec(async (error, guest) => {
    if (error) {
      winston.error({ error })
      return res.status(500).json({ error })
    }
    if (!guest || guest.email !== email) return res.status(401).json({
        message:
          'Invalid invitation. Please ask your administrator to send you an invitation again',
      })

    guest.name = name
    guest.username = username
    guest.password = await bcrypt.hash(`${password}${config.secret}`, 10)
    return guest.save(() => {
      nev.confirmTempUser(invitation, (error, user) => {
        if (error) {
          winston.error(error)
          return res.status(500).json({ error })
        }
        if (!user) return res.status(500).json({ message: 'Could not send create user information' })

        nev.sendConfirmationEmail(user.email, (error) => {
          if (error) {
            console.error(error)
          }
        })

        const token = jwt.sign(
          {
            _id: user._id,
            acc: user.access,
            cmp: user.company,
          },
          config.secret
        )

        const userObject = user.toObject()

        return res.status(200).json({
          token,
          user: {
            _id: userObject._id,
            name: userObject.name || 'User',
            access: userObject.access,
          },
        })
      })
    })
  })
})

router.route('/authenticate').post(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  const admin = await Admin.findOne({ email })
  if (user === null && admin === null) {
    console.info('user not found')
    winston.info('Failed to authenticate admin email')
    return res.status(400).json({ message: 'Authentication failed. Wrong user password.' })
  }
  try {
    return bcrypt
      .compare(`${password}${config.secret}`, admin.password)
      .then((result) => {
        const token = jwt.sign(
          {
            _id: admin._id,
            admin: true,
            cmp: admin.company,
          },
          config.secret
        )

        if (result) return res.status(200).json({
            token,
            user: getUserData(admin),
          })

        return res.status(401).json({ message: 'Authentication failed. Wrong admin or password' })
      })
      .catch((error) => {
        winston.info('Failed to authenticate admin password', error)
        return res.status(401).json({ message: 'Authentication failed. Wrong admin or password' })
      })
  } catch (error) {
    try {
      return bcrypt
        .compare(`${password}${config.secret}`, user.password)
        .then((result) => {
          const token = jwt.sign(
            {
              _id: user._id,
              admin: false,
              cmp: user.company,
            },
            config.secret
          )

          if (result) return res.status(200).json({
              token,
              user: getUserData(user),
            })

          return res.status(401).json({ message: 'Authentication failed. Wrong user or password' })
        })
        .catch((error) => {
          winston.info('Failed to authenticate user password', error)
          return res.status(401).json({ message: 'Authentication failed. Wrong user or password' })
        })
    } catch (err) {
      winston.error({ err })
      return res.status(500).json({ err }) // Causes an error for cannot set headers after sent
    }
  }
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

router.route('/users/self').get(async (req, res) => {
  const user = await User.findOne({ _id: req._user._id }, '-apiKey -password -toIndex')
  const admin = await Admin.findOne({ _id: req._user._id }, '-apiKey -password -toIndex')
  if (admin) {
    return res.status(200).json({ user: getUserData(admin) })
  } else if (user) {
    return res.status(200).json({ user: getUserData(user) })
  }

  winston.info('No user found')
  return res.status(400).json({ message: 'No user found' })
})

// Get all users information
router.route('/users').get(async (req, res) => {
  try {
    const users = await User.find({}).select(
      'username name surname company email isIndexing active'
    )

    return res.status(200).json({ users })
  } catch (error) {
    return res.status(500).json({ error: { message: 'Could not fetch users' } })
  }
})

// Edit user
router.route('/users/:user').put((req, res) => {
  const { name, company, username, email } = req.body
  const { user } = req.params
  if (!name || !company || !username || !email) return res.status(400).json({ error: { message: 'Malformed request' } })
  return User.findOneAndUpdate(
    { username: user },
    { $set: { name, company, username, email } }
  ).exec((error, user) => {
    if (error) {
      console.error('Could not update user information')
      return res.status(500).json({ error: { message: 'Could not update user information' } })
    }
    if (!user) return res.status(404).json({ success: false, message: 'User specified not found' })
    return res.status(200).json({
      success: true,
      message: 'Successfully updated user information',
      user,
    })
  })
})

// Delete user
router.route('/users/:username').delete((req, res) => {
  const { username } = req.params
  return User.findOneAndDelete({ username }).exec((error) => {
    if (error) {
      console.error('Could not delete user')
      return res.status(500).json({ error: { message: 'Could not delete user' } })
    }
    return res.status(200).json({ success: true, message: 'Successfully deleted user' })
  })
})

// Deactivate user
router.route('/users/:username/deactivate').patch((req, res) => {
  const { username } = req.params
  User.findOneAndUpdate({ username }, { $set: { active: false } }).exec((error, user) => {
    if (error) {
      console.error('Could not deactivate user')
      return res.status(500).json({ error: { message: 'Could not deactivate user' } })
    }
    return res.status(200).json({
      success: true,
      message: 'Successfully deactivated user',
      user,
    })
  })
})

// activate user
router.route('/users/:username/activate').patch((req, res) => {
  const { username } = req.params
  User.findOneAndUpdate({ username }, { $set: { active: true } }).exec((error, user) => {
    if (error) {
      console.error('Could not activate user')
      return res.status(500).json({ error: { message: 'Could not activate user' } })
    }
    return res.status(200).json({
      success: true,
      message: 'Successfully activated user',
      user,
    })
  })
})

// Export all users to CSV
router.route('/users/export').get((req, res) => {
  User.find({}).exec((error, users) => {
    if (error) {
      console.error('Could not export users', error)
      return res.status(500).json({ error: { message: 'Could not export users' } })
    }

    const json2csvParser = new Json2csvParser({ fields })
    const csv = json2csvParser.parse(users)
    return fs.writeFile('static/users.csv', csv, (error) => {
      if (error) {
        winston.error({ error })
        return res.status(500).json({ error })
      }
      return res.status(200).download('static/users.csv')
    })
  })
})

router.route('/admins').get(async (req, res) => {
  try {
    const admins = await Admin.find({}).select(
      'name surname username email superAdmin services active'
    )

    return res.status(200).json({ admins })
  } catch (error) {
    console.error('Could not get admins', error)
    return res.status(500).json({ error: { message: 'Could not get admins' } })
  }
})

// Edit admin
router
  .route('/admins/:adminUsername')
  .put((req, res) => {
    const { name, username, email } = req.body
    const { adminUsername } = req.params

    if (!name || !username || !email) {
      console.info({ name, username, email })
      return res.status(400).json({ error: { message: 'Malformed request' } })
    }

    return Admin.findOneAndUpdate(
      { username: adminUsername },
      { $set: { name, username, email } }
    ).exec((error, admin) => {
      if (error) {
        console.error('Could not update admin information')
        return res.status(500).json({ error: { message: 'Could not update admin information' } })
      }

      if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin specified not found' })
      }

      return res.status(200).json({
        success: true,
        message: 'Successfully updated admin information',
        admin,
      })
    })
  })
  .delete(async (req, res) => {
    const { adminUsername: username } = req.params

    try {
      await Admin.findOneAndDelete({ username })
      return res.status(200).json({ success: true, message: 'Successfully deleted admin' })
    } catch (error) {
      console.error('Could not delete admin')
      return res.status(500).json({ error: { message: 'Could not delete admin' } })
    }
  })

router.route('/admins/:username/deactivate').patch((req, res) => {
  const { username } = req.params
  Admin.findOneAndUpdate({ username }, { $set: { active: false } }).exec((error, admin) => {
    if (error) {
      console.error('Could not deactivate admin')
      return res.status(500).json({ error: { message: 'Could not deactivate admin' } })
    }
    return res.status(200).json({
      success: true,
      message: 'Successfully deactivated admin',
      admin,
    })
  })
})

router.route('/admins/:username/activate').patch((req, res) => {
  const { username } = req.params
  Admin.findOneAndUpdate({ username }, { $set: { active: true } }).exec((error, admin) => {
    if (error) {
      console.error('Could not activate admin')
      return res.status(500).json({ error: { message: 'Could not activate admin' } })
    }
    return res.status(200).json({
      success: true,
      message: 'Successfully activated admin',
      admin,
    })
  })
})

// Export all users to CSV
router.route('/admins/export').get((req, res) => {
  Admin.find({}).exec((error, admins) => {
    if (error) {
      console.error('Could not export admins', error)
      return res.status(500).json({ error: { message: 'Could not export admins' } })
    }

    const json2csvParser = new Json2csvParser({ fields: adminFields })
    const csv = json2csvParser.parse(admins)
    return fs.writeFile('static/admins.csv', csv, (error) => {
      if (error) {
        winston.error({ error })
        return res.status(500).json({ error })
      }
      return res.status(200).download('static/admins.csv')
    })
  })
})

// Rates endpoints
// GET all rates of user
router.route('/rates').get(async (req, res) => {
  try {
    const rates = await User.findOne({ _id: req._user._id })
    return res.status(200).json({ rates })
  } catch (error) {
    console.error('Could not get rates', error)
    return res.status(500).json({ error: { message: 'Could not get rates' } })
  }
})

// Edit in bulk all rates (this is the UX stablished in the mocks)
router.route('/rates').put(async (req, res) => {
  const { searchRates, indexRates } = req.body
  if (!searchRates || !indexRates || searchRates.length === 0 || indexRates.length === 0) return res.status(400).json({ error: { message: 'Malformed Request' } })
  try {
    // Validate that searchRates and indexRates are well formed
    if (searchRates[0].min > 1 || indexRates[0].min > 1) return res.status(403).json({ error: { message: 'Cannot insert a search invalid rate' } })

    for (let index = 1; index < searchRates.length; index += 1) {
      if (searchRates[index].min !== searchRates[index - 1].max + 1) return res.status(403).json({ error: { message: 'Cannot insert a search invalid rate' } })
    }

    for (let index = 1; index < indexRates.length; index += 1) {
      if (indexRates[index].min !== indexRates[index - 1].max + 1) return res.status(403).json({ error: { message: 'Cannot insert an search invalid rate' } })
    }

    await User.findOneAndUpdate({ _id: req._user._id }, { $set: { indexRates, searchRates } })
    return res.status(200).json({ success: true, message: 'Successfully updated rates' })
  } catch (error) {
    console.error('Could not update rates', error)
    return res.status(500).json({ error: { message: 'Could not update rates' } })
  }
})

// Add new search rate
router.route('/rates/search').post(async (req, res) => {
  const { min, max, cost } = req.body
  const rate = { min: parseInt(min, 10), max: parseInt(max, 10), cost }
  if (!min || !max || !cost || rate.min > rate.max) return res.status(400).json({ error: { message: 'Malformed request' } })
  try {
    const { searchRates } = await User.findOne({ _id: req._user._id }).select('searchRates')
    // If min is less than then
    searchRates.sort(($0, $1) => {
      return $0.min - $1.min
    })
    // Valid case for insert only
    if (
      (rate.min > searchRates[searchRates.length - 1].min &&
        rate.max > searchRates[searchRates.length - 1].max) ||
      rate.min === searchRates[searchRates.length - 1].max + 1
    ) {
      await User.findOneAndUpdate({ _id: req._user._id }, { $push: { searchRates: rate } })
      return res.status(200).json({ success: true, message: 'Successfully added search rate' })
    }
    return res.status(403).json({ error: { message: 'Cannot insert an search invalid rate' } })
  } catch (error) {
    console.error('Could not add search rate', error)
    return res.status(500).json({ error: { message: 'Could not add search rate' } })
  }
})

// Add new index rate
router.route('/rates/index').post(async (req, res) => {
  const { min, max, cost } = req.body
  const rate = { min: parseInt(min, 10), max: parseInt(max, 10), cost }
  if (!min || !max || !cost || rate.min > rate.max) return res.status(400).json({ error: { message: 'Malformed request' } })
  try {
    const { indexRates } = await User.findOne({ _id: req._user._id }).select('indexRates')
    // If min is less than then
    indexRates.sort(($0, $1) => {
      return $0.min - $1.min
    })
    // Valid case for insert only
    if (
      (rate.min < indexRates[0].min && rate.max < indexRates[0].min) ||
      rate.min === indexRates[indexRates.length - 1].max + 1
    ) {
      await User.findOneAndUpdate({ _id: req._user._id }, { $push: { indexRates: rate } })
      return res.status(200).json({ success: true, message: 'Successfully added index rate' })
    }
    return res.status(403).json({ error: { message: 'Cannot insert an invalid index rate' } })
  } catch (error) {
    console.error('Could not add search rate', error)
    return res.status(500).json({ error: { message: 'Could not add index rate' } })
  }
})

// Delete search rate
router.route('/rates/search/:rateId').delete(async (req, res) => {
  const _id = req.params.rateId.toString()
  try {
    await User.findOneAndUpdate({ _id: req._user._id }, { $pull: { searchRates: { _id } } })
    return res.status(200).json({ success: true, message: 'Successfully deleted search rate' })
  } catch (error) {
    console.error('Could not delete search rate', error)
    return res.status(500).json({ error: { message: 'Could not delete search rate' } })
  }
})

// Delete index rate
router.route('/rates/index/:rateId').delete(async (req, res) => {
  const _id = req.params.rateId.toString()
  try {
    await User.findOneAndUpdate({ _id: req._user._id }, { $pull: { indexRates: { _id } } })
    return res.status(200).json({ success: true, message: 'Successfully deleted index rate' })
  } catch (error) {
    console.error('Could not delete index rate', error)
    return res.status(500).json({ error: { message: 'Could not delete index rate' } })
  }
})

module.exports = router
