/* eslint-env node */
const fs = require('fs')
const path = require('path')
const express = require('express')
const paginate = require('express-paginate')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const nev = require('email-verification')(mongoose)
const rp = require('request-promise')
const Json2csvParser = require('json2csv').Parser

const router = new express.Router()

const User = require(path.resolve('models/User'))
const Guest = require(path.resolve('models/Guest'))
const Admin = require(path.resolve('models/Admin'))
const Indexing = require(path.resolve('models/Indexing'))
const Searching = require(path.resolve('models/Searching'))
const sesTransport = require('nodemailer-ses-transport')

const {
  JWT_SECRET,
  USE_ADMIN,
  USE_CLIENT,
  NODE_ENV: mode,
  ENGINE_URL,
  INV_PASS,
  INV_EMAIL,
  INV_USER,
  INV_EMAIL_HOST,
  AWS_SES,
  API_URL,
  DEFAULT_ADMIN_PASSWORD,
  AWS_SECRET_KEY,
  AWS_ACCESS_KEY,
} = process.env

const serviceUrl = ENGINE_URL

function getUserData(data) {
  return { ...data.toObject(), access: data.services ? 'admin' : 'user' }
}

async function asyncForEach(array, end, callback) {
  for (let index = 0; index < array.length + 1; index++) {
    if (index === array.length) {
      await end()
    } else {
      await callback(array[index], index, array)
    }
  }
}

const fields = JSON.parse(
  fs.readFileSync(path.resolve('./router/v1/private/FIELDS.json'))
)
const adminFields = JSON.parse(
  fs.readFileSync(path.resolve('./router/v1/private/ADMIN_FIELDS.json'))
)

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

nev.configure(
  {
    verificationURL: API_URL + '/signup?token=${URL}',
    recoveryURL: API_URL + '/reset-password?token=${URL}',
    // mongo configuration
    persistentUserModel: User,
    tempUserModel: Guest,
    expirationTime: 86400, // 24 hour expiration
    URLFieldName: 'invitation',
    transportOptions: transportOptions,
    verifyMailOptions: {
      from: `Do Not Reply <${INV_EMAIL}>`,
      subject: 'Confirm your account',
      html:
        '<p>Please verify your account by clicking <a href="${URL}">this link</a>. If you are unable to do so, copy and paste the following link into your browser:</p><p>${URL}</p>',
      text:
        'Please verify your account by clicking the following link, or by copying and pasting it into your browser: ${URL}',
    },
    shouldSendConfirmation: true,
    confirmMailOptions: {
      from: `Do Not Reply <${INV_EMAIL}>`,
      subject: 'Successfully verified!',
      html: '<p>Your account has been successfully verified.</p>',
      text: 'Your account has been successfully verified.',
    },
    recoveryOptions: {
        from: `Do Not Reply <${INV_EMAIL}>`,
        subject: 'Recupera tu contraseña',
        html: '<p>Recover your password using<a href="${URL}">this link</a>. If you are unable to do so, copy and ' +
            'paste the following link into your browser:</p><p>${URL}</p>',
        text: 'Recover your password clicking the following link, or by copying and pasting it into your browser: ${URL}',
    },
    hashingFunction: null,
  },
  (error) => {
    if (error) {
      console.error({ error })
    }
  }
)

// TODO: Only admins can trigger this action. Left here for RAD
router.route('/users/token/:username').post((req, res) => {
  const { username } = req.params
  User.findOne({ username }).exec((error, user) => {
    if (error || !user) {
      console.info('Failed to get user information', error)
      return res.status(500).json({
        error: { message: 'Could not fetch user information' },
      })
    }
    const value = jwt.sign(
      { _id: user._id, email: user.email, username: user.username },
      JWT_SECRET
    )
    const apiKey = {
      value,
      active: true,
    }
    user.apiKey = apiKey
    return user.save((error) => {
      if (error) {
        console.info('Could not save api token ', error)
        return res.status(500).json({
          error: { message: 'Could not generate API token' },
        })
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
        return res.status(500).json({
          error: { message: 'Could not update user information' },
        })
      }
      return res.status(200).json({
        success: true,
        message: `Revoked API token for user ${username}`,
      })
    })
  })
})

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

    await nev.sendRecoveryEmail(
      user.email,
      token)

    return res.status(200).json({ message: 'Email sent' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      error: { message: 'Could not generate API token' },
    })
  }
})

// Index images getting objects from S3
router.route('/images/index/:username').post(async (req, res) => {
  // Specific username to index images at the moment of petition
  const { username } = req.params
  let count = 0
  let user = ''
  let response = ''
  try {
    user = await User.findOneAndUpdate(
      { username },
      { $set: { isIndexing: true } }
    )
    if (!user) {
      return res.status(500).json({ message: 'User not found' })
    }
    if (user.toIndex.length === 0) {
      return res
        .status(200)
        .json({ success: false, message: 'Nothing to index' })
    }
  } catch (err) {
    console.error('User error', err)
    return res.status(500).json({ message: 'User Error' })
  }

  asyncForEach(user.toIndex ,
    async () => {
      await User.findOneAndUpdate(
          { username },
          {
            $set: { isIndexing: false},
          }
      )
    },
    async (image) => {
      const { id, sku, key } = image
      const path = process.env.PWD +
                      '/static/uploads/temp/' +
                      key.substr(key.lastIndexOf('/') + 1)

      // Create formData object to send to the service
      const formData = {
        id,
        sku,
        image: {
          value: fs.createReadStream(
            path
          ),
          options: {
            filename: image.filename,
          },
        },
        username,
      }
      try {
      // Call internal Flask service to process petition
        response = await rp.post({
            url: serviceUrl + '/v1/images/index',
            formData,
            resolveWithFullResponse: true,
        })
        if (response.statusCode === 200) {
          fs.unlink(path, (err) => {
              return Promise.reject(err)
          })
          count += 1
          // Build response object
          response = {
            success: JSON.parse(response.body).success,
            status: response.statusCode,
            features: JSON.parse(response.body).features,
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
          const indexObject = await new Indexing({
            response,
            request,
            user,
          })

          indexObject.save()
              // Add Indexing object to User and move toIndex object to IndexedImages
              // Remove item form the toIndex batch
          await User.findOneAndUpdate(
              { username },
              {
                $pull: { toIndex: image },
                $push: { indexings: indexObject._id},
              }
          )
          let index = 0
          for (index; index < user.indexRates.length; index += 1) {
            if (user.indexings.length <= user.indexRates[index].max) break
          }
          user.indexCost += user.indexRates[index].cost
          await user.save()
          return Promise.resolve()
        }
      } catch (err) {
        console.error('Could not index image', err)
        return res.status(500).json({ message: 'Server error ' + err })
      }
      return Promise.reject(new Error('Engine is not working correctly' + response.statusCode))
  }).catch((err) => {
    return res.status(410).json({ message: 'Error' + err})
  })
  return res.status(200).json({ success: true, count, user })
})

// Index images for all users that has pending images to index
router.route('/images/index').post(async (req, res) => {
  // Retrieve all users with pending toIndex images
  const users = await User.find({
    toIndex: { $exists: true },
    $where: 'this.toIndex.length>0',
  }).select('username')
  users.map(async (user) => {
    await rp.post({
      uri: `${API_URL}/v1/private/images/index/${user.username}`,
    })
  })

  return res
    .status(200)
    .json({ success: true, message: 'Batched all users images' })
})

// Statistics endpoint for dashboard
router.route('/stats/requests').get((req, res) => {
  const end = req.param('end'),
    start = req.param('start')

  Indexing.find({ timestamp: { $gte: start, $lte: end } })
    .select('id')
    .exec((error, indexings) => {
      if (error) {
        console.info('Could not fetch indexings', error)
        return res
          .status(500)
          .json({ error: { message: 'Could not fetch indexings' } })
      }

      return Searching.find({ timestamp: { $gte: start, $lte: end } })
        .select('id')
        .exec((error, searchings) => {
          if (error) {
            console.info('Could not fetch searches', error)
            return res.status(500).json({
              error: { message: 'Could not fetch searches' },
            })
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
router.route('/stats/request/details').get((req, res) => {
  const end = req.param('end'),
    start = req.param('start')

  Indexing.find({ timestamp: { $gte: start, $lte: end } }).exec(
    (error, indexings) => {
      if (error) {
        console.info('Could not fetch indexings', error)
        return res
          .status(500)
          .json({ error: { message: 'Could not fetch indexings' } })
      }
      return Searching.find({
        timestamp: { $gte: start, $lte: end },
      }).exec((error, searchings) => {
        if (error) {
          console.info('Could not fetch searches', error)
          return res.status(500).json({
            error: { message: 'Could not fetch searches' },
          })
        }
        const requests = {
          indexings: indexings,
          searches: searchings,
        }
        return res.status(200).json({ requests })
      })
    }
  )
})

router.route('/stats/requests/:username').get(async (req, res) => {
  const end = req.param('end') ? req.param('end') : Date.now(),
    start = req.param('start') ? req.param('start') : 1

  const { username } = req.params
  const user = await User.findOne({ username })
  Indexing.find({
    timestamp: { $gte: start, $lte: end },
    _id: { $in: user.indexings },
  })
    .select('id')
    .exec((error, indexings) => {
      if (error) {
        console.info('Could not fetch indexings', error)
        return res
          .status(500)
          .json({ error: { message: 'Could not fetch indexings' } })
      }
      console.log('indexings encontrados: ')
      console.log(indexings)
      return Searching.find({
        timestamp: { $gte: start, $lte: end },
        _id: { $in: user.searches },
      })
        .select('id')
        .exec((error, searchings) => {
          if (error) {
            console.info('Could not fetch searches', error)
            return res.status(500).json({
              error: { message: 'Could not fetch searches' },
            })
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
  const end = req.param('end'),
    start = req.param('start')

  User.aggregate([
    {
      $project: {
        indexings: {
          $filter: {
            input: '$indexings',
            as: 'item',
            cond: {
              $and: [
                { $gte: [start, '$$item.timestamp'] },
                { $lte: ['$$item.timestamp', end] },
              ],
            },
          },
        },
        searches: {
          $filter: {
            input: '$searches',
            as: 'item',
            cond: {
              $and: [
                { $gte: [start, '$$item.timestamp'] },
                { $lte: ['$$item.timestamp', end] },
              ],
            },
          },
        },
        searchRates: 1,
        indexRates: 1,
        username: 1,
        email: 1,
        company: 1,
        indexCost: 1,
        searchCost: 1,
      },
    },
  ]).exec((error, users) => {
    if (error) {
      console.info('Could not fetch users', error)
      return res
        .status(500)
        .json({ error: { message: 'Could not fetch users' } })
    }

    users.map((user) => {
      user.billing = user.indexCost + user.searchCost
      return user
    })

    // Finally sort users by billing
    users.sort(($0, $1) => {
      $0.billing - $1.billing
    })
    return res.status(200).json({ users })
  })
})

// Statistics endpoint for dashboard
router.route('/stats/users/:username/billing').get((req, res) => {
  // Find all users
  const end = req.param('end') ? req.param('end') : Date.now(),
    start = req.param('start') ? req.param('start') : 1

  const { username } = req.params
  User.aggregate([
    { $match: { username } },
    {
      $project: {
        indexings: {
          $filter: {
            input: '$indexings',
            as: 'item',
            cond: {
              $and: [
                { $gte: [start, '$$item.timestamp'] },
                { $lte: ['$$item.timestamp', end] },
              ],
            },
          },
        },
        searches: {
          $filter: {
            input: '$searches',
            as: 'item',
            cond: {
              $and: [
                { $gte: [start, '$$item.timestamp'] },
                { $lte: ['$$item.timestamp', end] },
              ],
            },
          },
        },
        searchRates: 1,
        indexRates: 1,
        username: 1,
        email: 1,
        company: 1,
        indexCost: 1,
        searchCost: 1,
      },
    },
  ]).exec((error, users) => {
    if (error || !users[0]) {
      console.info('Could not fetch users', error)
      return res
        .status(500)
        .json({ error: { message: 'Could not fetch users' } })
    }

    users[0].billing = users[0].indexCost + users[0].searchCost

    return res.status(200).json({ ...users[0] })
  })
})

router.route('/users/invite').post(async (req, res) => {
  const { email } = req.body
  const guest = new User({
    email,
    host: req._user,
  })
  const admin = await Admin.findOne({ email })

  if (!admin) {
    return nev.createTempUser(
      guest,
      (error, existingPersistentUser, newTempUser) => {
        if (error) {
          console.error({ error })
          return res.status(500).json({ error })
        }
        if (existingPersistentUser) return res.status(409).json({ error: 'User already registered' })
        if (newTempUser) {
          const URL = newTempUser[nev.options.URLFieldName]
          return nev.sendVerificationEmail(email, URL, (error) => {
            if (error) return res.status(500).json({ error })
            return res
              .status(200)
              .json({ message: 'Invitation successfully sent' })
          })
        }
        return nev.resendVerificationEmail(email, (error, userFound) => {
          if (userFound) return res
              .status(200)
              .json({ message: 'Invitation resent successfully' })
          if (error) return res.status(500).json({ error })
          return res.status(409).json({ error: 'User already invited' })
        })
      },
      (error) => {
        console.error({ error })
      }
    )
  }
  return res.status(409).json({ error: 'User is an admin' })
})

router.route('/admins/invite').post(async (req, res) => {
  const { email, services, username, name } = await req.body
  if (!name || !username || !email || !services) {
    console.info({ name, username, email })
    return res.status(400).json({ error: { message: 'Malformed request' } })
  }
  const password = await bcrypt.hash(
    `${DEFAULT_ADMIN_PASSWORD}${JWT_SECRET}`,
    10
  )
  const admin = await Admin({
    username,
    name,
    email,
    services,
    host: req._user,
    password: password,
  })
  return admin.save((error) => {
    if (error) {
      console.error('error saving admin, verify email not repited', error)
      return res.status(500).json({
        error: { message: 'could not save admin, email repited' },
      })
    }
    return res.status(200).json({ success: true, message: 'admin added' })
  })
})

router.post('/signup/:invitation', async (req, res) => {
  const { invitation } = req.params
  const { email, password, username, fullName } = req.body

  if (!invitation) return res.status(401).json({ message: 'No invitation token provided' })

  try {
    const admin = await Admin.findOne({ email })
    const guest = await Guest.findOne({ invitation })

    if (!guest || guest.email !== email) {
      return res.status(401).json({
        message:
          'Invalid invitation. Please ask your administrator to send you an invitation again',
      })
    }

    if (!admin) {
      guest.name = fullName
      guest.username = username
      guest.password = await bcrypt.hash(`${password}${JWT_SECRET}`, 10)
      await guest.save()

      return nev.confirmTempUser(invitation, (error, user) => {
        if (error) {
          console.error(error)
          return res.status(500).json({ error })
        }

        if (!user) return res.status(500).json({
            message: 'Could not send create user information',
          })

        nev.sendConfirmationEmail(user.email, (error) => {
          if (error) {
            console.error(error)
          }
        })

        const formData = {
          username,
        }

        // Create user in engine
        return rp
          .post({
            url: serviceUrl + '/v1/user',
            formData,
            resolveWithFullResponse: true,
          })
          .then((resp) => {
            console.info(resp.statusCode, resp.body)
            // After getting response from internal server service, create a new Indexing Object
            const token = jwt.sign(
              {
                _id: user._id,
                acc: user.access,
                cmp: user.company,
              },
              JWT_SECRET
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
          .catch((error) => {
            console.error('Could not  image', error)
            return res.status(500).json({
              success: false,
              message: 'Could not create user on Engine',
            })
          })
      })
    }
    return res.status(409).json({ error: 'Admin email alredy exist' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Could not create user' })
  }
})

router.route('/authenticate').post(async (req, res) => {
  const { email, password } = req.body

  let user

  console.log({ USE_CLIENT })

  if (USE_CLIENT === 'true') {
    console.log('USER USE TRUE')
    user = await User.findOne({ email, active: true })
  } else {
    console.log('USER USE FALSE')
  }

  console.log({ user })

  if (!user && USE_ADMIN === 'true') {
    user = await Admin.findOne({ email })
    if (user) user.isAdmin = true
  }

  console.log({ user })

  if (!user) {
    return res.status(409).json({
      message: 'Authentication failed. User deactivated or eliminated',
    })
  }

  try {
    const match = await bcrypt.compare(
      `${password}${JWT_SECRET}`,
      user.password
    )

    console.log({ match })

    if (!match) {
      return res.status(401).json({
        message: 'Authentication failed. Wrong admin or password',
      })
    }

    console.log(Boolean(user.isAdmin))

    const token = jwt.sign(
      {
        _id: user._id,
        admin: Boolean(user.isAdmin),
        cmp: user.company,
      },
      JWT_SECRET
    )

    return res.status(200).json({
      token,
      user: getUserData(user),
    })
  } catch (error) {
    console.info('Failed to authenticate admin password', error)

    return res
      .status(401)
      .json({ message: 'Authentication failed. Wrong admin or password' })

    // /
    // /
  }
})

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

router.use((req, res, next) => {
  const bearer = req.headers.authorization || 'Bearer '
  const token = bearer.split(' ')[1]
  if (!token) {
    return res
      .status(401)
      .send({ error: { message: 'No bearer token provided' } })
  }

  return jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        error: { message: 'Failed to authenticate  bearer token' },
      })
    }

    req._user = decoded
    req._token = token
    return next()
  })
})

// Statistics endpoint for dashboard
router.route('/stats/searches/topsearches').get(async (req, res) => {
  try {
    const searches = await Searching.find({ user: req._user._id })
    const items = []
    searches.map((search) => {
      if (search.response.status == 200 && search.response.items.length > 0) {
        const item = {
          id: search.response.items[0].id,
          sku: search.response.items[0].sku,
          cl: search.response.items[0].cl,
          score: search.response.items[0].score,
        }
        items.push(item)
      }
    })

    const counts = {}
    items.map(($0) => {
      counts[$0.sku] = (counts[$0.sku] || 0) + 1
    })

    const mostSearchedItems = items.filter(
      (thing, index, self) =>
        index ===
        self.findIndex(($0) => $0.id === thing.id && $0.sku === thing.sku)
    )

    mostSearchedItems.map((item) => {
      item.count = counts[item.sku]
    })
    return res
      .status(200)
      .json({ mostSearchedItems: mostSearchedItems.slice(0, 9), counts })
  } catch (error) {
    console.error('Could not retrieve searches', error)
    return res.status(500).json({
      success: false,
      message: 'Could not retrieve searches',
      error,
    })
  }
})

router.route('/users/self').get(async (req, res) => {
  let user = null
  let admin = null
  if (USE_CLIENT === 'true') {
    user = await User.findOne(
      { _id: req._user._id },
      '-apiKey -password -toIndex'
    ).populate('indexings searches')
  }
  if (USE_ADMIN === 'true') {
    admin = await Admin.findOne(
      { _id: req._user._id },
      '-apiKey -password -toIndex'
    )
  }
  if (admin) {
    return res.status(200).json({ user: getUserData(admin) })
  } else if (user) {
    return res.status(200).json({ user: getUserData(user) })
  }

  console.info('No user found')
  return res.status(400).json({ message: 'No user found' })
})

router.route('/users/token').get(async (req, res) => {
  try {
    const user = await User.findOne({ _id: req._user._id }).select('apiKey')
    if (user) {
      return res.status(200).json({ user })
    }
  } catch (error) {
    return res.status(500).json({ error: { message: 'Could not fetch users' } })
  }
  console.info('No user found')
  return res.status(400).json({ message: 'No user found' })
})

// Edit user
router.route('/users/:user').put((req, res) => {
  const newValues = {}
  const acceptedKeys = [
    'name',
    'company',
    'username',
    'email',
    'searchLimit',
    'indexLimit',
    'rfc',
    'postalCode',
    'businessName',
  ]
  const { user } = req.params
  for (const key in req.body) {
    if (acceptedKeys.includes(key)) {
    newValues[key] = req.body[key]
    }
  }
  if (!newValues.name || !newValues.username || !newValues.email) return res.status(400).json({ error: { message: 'Malformed request' } })
  return User.findOneAndUpdate(
    { username: user },
    {
      $set: newValues,
    }
  ).exec((error, user) => {
    if (error) {
      return res.status(500).json({
        error: { message: 'Could not update user information' },
      })
    }
    if (!user) return res
        .status(404)
        .json({ success: false, message: 'User specified not found' })
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
      return res
        .status(500)
        .json({ error: { message: 'Could not delete user' } })
    }
    const formData = {
      username,
    }

    // Create user in engine
    return rp
      .delete({
        url: serviceUrl + '/v1/user',
        formData,
        resolveWithFullResponse: true,
      })
      .then((resp) => {
        console.info(resp.statusCode, resp.body)
        return res.status(200).json({
          success: true,
          message: 'Successfully deleted user',
        })
      })
      .catch((error) => {
        console.error('Could not delete user', error)
        return res
          .status(500)
          .json({ success: false, message: 'Could not delete user' })
      })
  })
})

// Deactivate user
router.route('/users/:username/deactivate').patch((req, res) => {
  const { username } = req.params
  User.findOneAndUpdate({ username }, { $set: { active: false } }).exec(
    (error, user) => {
      if (error) {
        console.error('Could not deactivate user')
        return res
          .status(500)
          .json({ error: { message: 'Could not deactivate user' } })
      }
      return res.status(200).json({
        success: true,
        message: 'Successfully deactivated user',
        user,
      })
    }
  )
})

// activate user
router.route('/users/:username/activate').patch((req, res) => {
  const { username } = req.params
  User.findOneAndUpdate({ username }, { $set: { active: true } }).exec(
    (error, user) => {
      if (error) {
        console.error('Could not activate user')
        return res
          .status(500)
          .json({ error: { message: 'Could not activate user' } })
      }
      return res.status(200).json({
        success: true,
        message: 'Successfully activated user',
        user,
      })
    }
  )
})

// Export all users to CSV
router.route('/users/export').get((req, res) => {
  User.find({}).exec((error, users) => {
    if (error) {
      console.error('Could not export users', error)
      return res
        .status(500)
        .json({ error: { message: 'Could not export users' } })
    }

    const json2csvParser = new Json2csvParser({ fields })
    const csv = json2csvParser.parse(users)
    return fs.writeFile('static/users.csv', csv, (error) => {
      if (error) {
        console.error({ error })
        return res.status(500).json({ error })
      }
      return res.status(200).download('static/users.csv')
    })
  })
})

// Export all users to CSV
router.route('/users/export').get((req, res) => {
  User.find({}).exec((error, users) => {
    if (error) {
      console.error('Could not export users', error)
      return res
        .status(500)
        .json({ error: { message: 'Could not export users' } })
    }

    const json2csvParser = new Json2csvParser({ fields })
    const csv = json2csvParser.parse(users)
    return fs.writeFile('static/users.csv', csv, (error) => {
      if (error) {
        console.error({ error })
        return res.status(500).json({ error })
      }
      return res.status(200).download('static/users.csv')
    })
  })
})

router
  .route('/users/notifications/read/:notification')
  .patch(async (req, res) => {
    const { notification } = req.params
    try {
      const user = await User.findOneAndUpdate(
        { _id: req._user._id },
        { $pull: { notifications: notification } }
      )
      return res.status(200).json({
        success: true,
        message: 'Successfully read notification',
        user,
      })
    } catch (error) {
      console.error('Could not update user information', error)
      return res.status(500).json({
        error: { message: 'Could not update user information' },
      })
    }
  })

router.route('/users/password').patch(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body
  if (!newPassword || !currentPassword || !currentPassword) return res
      .status(400)
      .json({ success: false, message: 'Malformed request' })
  if (newPassword !== confirmPassword) return res
      .status(400)
      .json({ success: false, message: 'Passwords does not match' })
  try {
    const user = await User.findOne({ _id: req._user._id })
    const result = await bcrypt.compare(
      `${currentPassword}${JWT_SECRET}`,
      user.password
    )
    if (!result) return res.status(401).json({
        success: false,
        message: 'Current password does not match',
      })
    user.password = await bcrypt.hash(`${newPassword}${JWT_SECRET}`, 10)
    await user.save()
    return res
      .status(200)
      .json({ success: true, message: 'Successfully updated password' })
  } catch (error) {
    console.error('Could not update password', error)
    return res
      .status(500)
      .json({ error: { message: 'Could not update password' } })
  }
})

// RESET BILLING AND IT TO THE MONTHLY COSTS OF EVERY USER
router.route('/users/billing/reset').patch(async (req, res) => {
  try {
    const users = await User.find({}).select(
      'indexCost searchCost monthlyIndexCosts monthlySearchCosts'
    )

    users.map(async (user) => {
      const monthlyIndexCost = {
        billing: user.indexCost,
      }

      const monthlySearchCost = {
        billing: user.searchCost,
      }

      user.indexCost = 0
      user.searchCost = 0

      user.monthlyIndexCosts.push(monthlyIndexCost)
      user.monthlySearchCosts.push(monthlySearchCost)

      await user.save()
    })

    return res.status(200).json({ users })
  } catch (error) {
    console.error('Could not reset billing', error)
    return res
      .status(500)
      .json({ error: { message: 'Could not reset billing' } })
  }
})

// Edit admin
router
  .route('/admins/:adminUsername')
  .put((req, res) => {
    const { name, username, email, services } = req.body
    const { adminUsername } = req.params

    if (!name || !username || !email || !services) {
      console.info({ name, username, email })
      return res.status(400).json({ error: { message: 'Malformed request' } })
    }

    return Admin.findOneAndUpdate(
      { username: adminUsername },
      { $set: { name, username, email, services } }
    ).exec((error, admin) => {
      if (error) {
        console.error('Could not update admin information')
        return res.status(500).json({
          error: {
            message: 'Could not update admin information',
          },
        })
      }

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin specified not found',
        })
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
      return res
        .status(200)
        .json({ success: true, message: 'Successfully deleted admin' })
    } catch (error) {
      console.error('Could not delete admin')
      return res
        .status(500)
        .json({ error: { message: 'Could not delete admin' } })
    }
  })

router.route('/admins/:username/deactivate').patch((req, res) => {
  const { username } = req.params
  Admin.findOneAndUpdate({ username }, { $set: { active: false } }).exec(
    (error, admin) => {
      if (error) {
        console.error('Could not deactivate admin')
        return res
          .status(500)
          .json({ error: { message: 'Could not deactivate admin' } })
      }
      return res.status(200).json({
        success: true,
        message: 'Successfully deactivated admin',
        admin,
      })
    }
  )
})

router.route('/admins/:username/activate').patch((req, res) => {
  const { username } = req.params
  Admin.findOneAndUpdate({ username }, { $set: { active: true } }).exec(
    (error, admin) => {
      if (error) {
        console.error('Could not activate admin')
        return res
          .status(500)
          .json({ error: { message: 'Could not activate admin' } })
      }
      return res.status(200).json({
        success: true,
        message: 'Successfully activated admin',
        admin,
      })
    }
  )
})

// Export all users to CSV
router.route('/admins/export').get((req, res) => {
  Admin.find({}).exec((error, admins) => {
    if (error) {
      console.error('Could not export admins', error)
      return res
        .status(500)
        .json({ error: { message: 'Could not export admins' } })
    }

    const json2csvParser = new Json2csvParser({ fields: adminFields })
    const csv = json2csvParser.parse(admins)
    return fs.writeFile('static/admins.csv', csv, (error) => {
      if (error) {
        console.error({ error })
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
    const rates = await User.findOne().select('searchRates indexRates')
    return res.status(200).json({ rates })
  } catch (error) {
    console.error('Could not get rates', error)
    return res.status(500).json({ error: { message: 'Could not get rates' } })
  }
})

// Edit in bulk all rates (this is the UX stablished in the mocks)
router.route('/rates').put(async (req, res) => {
  const { searchRates, indexRates } = req.body
  if (
    !searchRates ||
    !indexRates ||
    searchRates.length === 0 ||
    indexRates.length === 0
  ) return res.status(400).json({ error: { message: 'Malformed Request' } })
  try {
    // Validate that searchRates and indexRates are well formed
    if (searchRates[0].min > 1 || indexRates[0].min > 1) return res.status(403).json({
        error: { message: 'Cannot insert a search invalid rate' },
      })

    for (let index = 1; index < searchRates.length; index += 1) {
      if (searchRates[index].min !== searchRates[index - 1].max + 1) return res.status(403).json({
          error: {
            message: 'Cannot insert a search invalid rate',
          },
        })
    }

    for (let index = 1; index < indexRates.length; index += 1) {
      if (indexRates[index].min !== indexRates[index - 1].max + 1) return res.status(403).json({
          error: {
            message: 'Cannot insert an search invalid rate',
          },
        })
    }

    await User.updateMany({}, { $set: { indexRates, searchRates } })
    return res
      .status(200)
      .json({ success: true, message: 'Successfully updated rates' })
  } catch (error) {
    console.error('Could not update rates', error)
    return res
      .status(500)
      .json({ error: { message: 'Could not update rates' } })
  }
})

// Add new search rate
router.route('/rates/search').post(async (req, res) => {
  const { min, max, cost } = req.body
  const rate = { min: parseInt(min, 10), max: parseInt(max, 10), cost }
  if (!min || !max || !cost || rate.min > rate.max) return res.status(400).json({ error: { message: 'Malformed request' } })
  try {
    const { searchRates } = await User.findOne().select('searchRates')
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
      await User.updateMany({}, { $push: { searchRates: rate } })
      return res.status(200).json({
        success: true,
        message: 'Successfully added search rate',
      })
    }
    return res.status(403).json({
      error: { message: 'Cannot insert an search invalid rate' },
    })
  } catch (error) {
    console.error('Could not add search rate', error)
    return res
      .status(500)
      .json({ error: { message: 'Could not add search rate' } })
  }
})

// Add new index rate
router.route('/rates/index').post(async (req, res) => {
  const { min, max, cost } = req.body
  const rate = { min: parseInt(min, 10), max: parseInt(max, 10), cost }
  if (!min || !max || !cost || rate.min > rate.max) return res.status(400).json({ error: { message: 'Malformed request' } })
  try {
    const { indexRates } = await User.findOne().select('indexRates')
    // If min is less than then
    indexRates.sort(($0, $1) => {
      return $0.min - $1.min
    })
    // Valid case for insert only
    if (
      (rate.min < indexRates[0].min && rate.max < indexRates[0].min) ||
      rate.min === indexRates[indexRates.length - 1].max + 1
    ) {
      await User.updateMany({}, { $push: { indexRates: rate } })
      return res.status(200).json({
        success: true,
        message: 'Successfully added index rate',
      })
    }
    return res
      .status(403)
      .json({ error: { message: 'Cannot insert an invalid index rate' } })
  } catch (error) {
    console.error('Could not add search rate', error)
    return res
      .status(500)
      .json({ error: { message: 'Could not add index rate' } })
  }
})

// Delete search rate
router.route('/rates/search/:rateId').delete(async (req, res) => {
  const _id = req.params.rateId.toString()
  try {
    const user = await User.findOne({ _id: req._user._id }).select(
      'searchRates'
    )
    if (user.searchRates[0]._id == _id) return res.status(403).json({
        success: false,
        message: 'Cannot delete first search rate',
      })
    await User.updateMany({}, { $pull: { searchRates: { _id } } })
    return res.status(200).json({
      success: true,
      message: 'Successfully deleted search rate',
    })
  } catch (error) {
    console.error('Could not delete search rate', error)
    return res
      .status(500)
      .json({ error: { message: 'Could not delete search rate' } })
  }
})

// Delete index rate
router.route('/rates/index/:rateId').delete(async (req, res) => {
  const _id = req.params.rateId.toString()
  try {
    const user = await User.findOne({ _id: req._user._id }).select('indexRates')
    if (user.indexRates[0]._id == _id) return res.status(403).json({
        success: false,
        message: 'Cannot delete first index rate',
      })
    await User.updateMany({}, { $pull: { indexRates: { _id } } })
    return res
      .status(200)
      .json({ success: true, message: 'Successfully deleted index rate' })
  } catch (error) {
    console.error('Could not delete index rate', error)
    return res
      .status(500)
      .json({ error: { message: 'Could not delete index rate' } })
  }
})

// Pagination middleware
router.use(paginate.middleware(10, 50))

// Get all users information
router.route('/users').get(async (req, res) => {
  const search = req.param('search')
  try {
    const [users, itemCount] = await Promise.all([
      User.find({
        $or: [
          { name: { $regex: new RegExp(search, 'i') } },
          { email: { $regex: new RegExp(search, 'i') } },
          { company: { $regex: new RegExp(search, 'i') } },
        ],
      })
        .select(
          'username name company email isIndexing active apiKey.active toIndex'
        )
        .sort({ name: 1 })
        .limit(req.query.limit)
        .skip(req.skip)
        .lean(),
      User.count({}),
    ])

    const pageCount = Math.ceil(itemCount / req.query.limit)

    return res.status(200).json({
      users,
      hasMore: paginate.hasNextPages(req)(pageCount),
      pageCount,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: { message: 'Could not fetch users' } })
  }
})

// Get all admins information
router.route('/admins').get(async (req, res) => {
  const search = req.param('search')

  try {
    const [admins, itemCount] = await await Promise.all([
      Admin.find({
        $or: [
          { name: { $regex: new RegExp(search, 'i') } },
          { username: { $regex: new RegExp(search, 'i') } },
          { email: { $regex: new RegExp(search, 'i') } },
        ],
      })
        .select('name username email superAdmin services active')
        .sort({ name: 1 })
        .limit(req.query.limit)
        .skip(req.skip)
        .lean(),
      Admin.count({}),
    ])
    const pageCount = Math.ceil(itemCount / req.query.limit)

    return res.status(200).json({
      admins,
      hasMore: paginate.hasNextPages(req)(pageCount),
      pageCount,
    })
  } catch (error) {
    console.error('Could not get admins', error)
    return res.status(500).json({ error: { message: 'Could not get admins' } })
  }
})

// Get all guests information
router.route('/guests').get(async (req, res) => {
  const search = req.param('search')
  try {
    const [guests, itemCount] = await Promise.all([
      Guest.find({ email: { $regex: new RegExp(search, 'i') } })
        .sort({ email: 1 })
        .limit(req.query.limit)
        .skip(req.skip)
        .lean(),
      Guest.count({}),
    ])

    const pageCount = Math.ceil(itemCount / req.query.limit)

    return res.status(200).json({
      guests,
      hasMore: paginate.hasNextPages(req)(pageCount),
      pageCount,
    })
  } catch (error) {
    return res
      .status(500)
      .json({ error: { message: 'Could not fetch guests' } })
  }
})
.post((req, res) => {
  const { email } = req.body
  return Guest.findOneAndDelete({ email }).exec((error) => {
    if (error) {
      console.error('Could not delete guest')
      return res
        .status(500)
        .json({ error: { message: 'Could not delete guest' } })
    }
    return res.status(200).json({
      success: true,
      message: 'Successfully deleted guest',
    })
  })
})

module.exports = router
