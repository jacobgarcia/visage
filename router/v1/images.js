/* eslint-env node */
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const express = require('express')
const winston = require('winston')
const router = new express.Router()
const mime = require('mime')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const request = require('request')
const rp = require('request-promise')
const AWS = require('aws-sdk')
const cors = require('cors')
const s3 = new AWS.S3()
const Json2csvParser = require('json2csv').Parser

const config = require(path.resolve('config'))

const User = require(path.resolve('models/User'))
const Indexing = require(path.resolve('models/Indexing'))
const Searching = require(path.resolve('models/Searching'))
const Admin = require(path.resolve('models/Admin'))

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, 'static/uploads/temp'),
  filename: (req, file, callback) => {
    crypto.pseudoRandomBytes(16, (error, raw) => {
      callback(null, raw.toString('hex') + Date.now() + '.' + mime.getExtension(file.mimetype))
    })
  },
})

const upload = multer({ storage })
const serviceUrl = 'https://admin.vs-01-dev.qbo.tech'

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

router.route('/token/generate/:username').post((req, res) => {
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

// TODO: Validate with hasAccess
router.route('/token/revoke/:username').post((req, res) => {
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
        message: 'Revoked API token for user ' + username,
      })
    })
  })
})

/*
  C O R S   S T U F F
*/

router.options('*', cors())
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

router.use((req, res, next) => {
  const bearer = req.headers.authorization || 'Bearer '
  const token = bearer.split(' ')[1]

  if (!token) return res.status(401).send({ error: { message: 'No bearer token provided' } })
  return jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      winston.error('Failed to authenticate token', err, token)
      return res.status(401).json({ error: { message: 'Invalid API token' } })
    }
    req._user = decoded
    return User.findOne({ username: req._user.username }).exec((error, user) => {
      if (error || !user) {
        return res.status(401).json({
          error: { message: 'Could not found a token for a valid user' },
        })
      }
      if (!user.apiKey.active) return res.status(401).json({
          success: false,
          message: 'Your API token is inactive. Re-issue a new token',
        })
      req._token = token
      return next()
    })
  })
})

router.route('/images/search').post(upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: { message: 'Could not get file info' } })
  const imagePath = `/static/uploads/temp/${req.file.filename}`

  // Call internal Flask service to process petition
  const formData = {
    image: {
      value: fs.createReadStream(process.env.PWD + imagePath),
      options: {
        filename: req.file.filename,
      },
    },
  }
  return request.post({ url: serviceUrl + '/v1/images/search', formData }, (error, resp) => {
    if (error) {
      console.info('Could not index image', error)
      return res.status(500).json({ error: { message: 'Could not index image' } })
    }

    const response = {
      success: resp.statusCode === 200,
      status: resp.statusCode,
      items: JSON.parse(resp.body).hits,
    }
    // After getting response from internal server service, create a new Indexing Object
    // First create the request custom Object
    const request = {
      route: req.route,
      file: req.file,
      token: req._token,
      headers: req.headers,
    }

    // Create new Indexing object
    return new Searching({
      response,
      request,
      user: req._user._id,
    }).save((error, search) => {
      if (error) {
        console.info('Could not create searching object', error)
        return res.status(500).json({ error: { message: 'Could not create searching object' } })
      }
      // Add Indexing object to User
      User.findOneAndUpdate(
        { username: req._user.username },
        { $push: { searches: search._id } }
      ).exec(error)
      // Then return response from internal server
      return res.status(200).json(response)
    })
  })
})

// This method uploads the image to S3 and adds it to an toIndex array
router.route('/images/index/batch').post(upload.single('image'), (req, res) => {
  const { id, sku } = req.body
  const image = req.file
  if (!id || !sku || !image) return res.status(400).json({ error: { message: 'Malformed Request' } })

  // Upload image to S3
  return fs.readFile(image.path, (error, data) => {
    if (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: 'Could not read uploaded file',
      })
    }

    const base64data = Buffer.from(data, 'binary')
    const key = req._user.username + '/' + image.filename
    return s3.putObject(
      {
        Bucket: 'visual-search-qbo',
        Key: key,
        Body: base64data,
        ACL: 'public-read',
      },
      (error) => {
        if (error) {
          console.error(error)
          return res.status(500).json({
            success: false,
            message: 'Could not put object to S3 bucket',
          })
        }

        // Put the image to the toIndex on User
        const indexedImage = {
          name: image.filename,
          id,
          sku,
          key,
        }
        return User.findOneAndUpdate(
          { username: req._user.username },
          { $push: { toIndex: indexedImage } }
        ).exec((error) => {
          if (error) {
            console.error('Could not batch image', error)
            return res.status(500).json({ error: { message: 'Could not batch image' } })
          }
          // Then return response from internal server
          return res.status(200).json({ success: true, message: 'Batched image' })
        })
      }
    )
  })
})

// Index images getting objects from S3
router.route('/images/index/action/:username').post((req, res) => {
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

// Old method. This will be deprecated with a batch process
router.route('/images/index').post(upload.single('image'), (req, res) => {
  const { id, sku } = req.body
  const indexedImages = []
  const image = req.file
  if (!id || !sku || !image) return res.status(400).json({ error: { message: 'Malformed request' } })

  const url = `/static/uploads/temp/${image.filename}`
  const indexedImage = {
    url,
    name: image.filename,
  }
  indexedImages.push(indexedImage)

  // Upload image to S3
  return fs.readFile(image.path, (error, data) => {
    if (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: 'Could not read uploaded file',
      })
    }

    const base64data = Buffer.from(data, 'binary')
    return s3.putObject(
      {
        Bucket: 'visual-search-qbo',
        Key: req._user.username + '/' + image.filename,
        Body: base64data,
        ACL: 'public-read',
      },
      (error) => {
        if (error) {
          console.error(error)
          return res.status(500).json({
            success: false,
            message: 'Could not put object to S3 bucket',
          })
        }

        // Call internal Flask service to process petition
        const formData = {
          id,
          sku,
          image: {
            value: fs.createReadStream(process.env.PWD + url),
            options: {
              filename: image.filename,
            },
          },
        }
        return request.post({ url: serviceUrl + '/v1/images/index', formData }, (error, resp) => {
          if (error) {
            console.error('Could not index image', error)
            return res.status(500).json({ error: { message: 'Could not index image' } })
          }

          const response = {
            success: JSON.parse(resp.body).success,
            status: 200 || resp.statusCode,
            count: 1,
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
          return new Indexing({
            response,
            request,
            user: req._user._id,
          }).save((error, indexing) => {
            if (error) {
              return res.status(500).json({
                error: { message: 'Could not create indexing object' },
              })
            }
            // Add Indexing object to User
            User.findOneAndUpdate(
              { username: req._user.username },
              { $push: { indexings: indexing._id, indexedImages } }
            ).exec(error)
            // Then return response from internal server
            return res.status(200).json(response)
          })
        })
      }
    )
  })
})

// Delete image from the indexed images
router.route('/images/:id').delete((req, res) => {
  const { id } = req.params

  // Remove object from database
  User.findOneAndUpdate(
    { username: req._user.username },
    { $pull: { indexedImages: { name: id } } }
  ).exec((error) => {
    if (error) {
      console.info('Could not delete indexed image', error)
      return res.status(500).json({ error: { message: 'Could not delete indexed image' } })
    }

    // Remove object from S3
    return s3.deleteObject(
      {
        Bucket: 'visual-search-qbo',
        Key: req._user.username + '/' + id,
      },
      (error) => {
        if (error) {
          console.info('Could not delete indexed image from S3', error)
          return res.status(500).json({
            error: { message: 'Could not delete indexed image from S3' },
          })
        }
        // Call internal service
        const formData = {
          id,
        }
        return request.delete(
          { url: serviceUrl + '/v1/images/delete', formData },
          (error, resp) => {
            if (error) {
              console.error('Could not index image', error)
              return res.status(500).json({ error: { message: 'Could not index image' } })
            }
            const response = {
              success: JSON.parse(resp.body).success.deleted > 0,
              status: resp.statusCode,
            }

            return res.status(200).json(response)
          }
        )
      }
    )
  })
})

/** *** ENDPOINTS FOR ADMIN PANEL ******/
// Statistics endpoint for dashboard
router.route('/stats/petitions').get((req, res) => {
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
          const petitions = {
            indexings: indexings.length,
            searches: searchings.length,
            total: indexings.length + searchings.length,
          }
          return res.status(200).json({ petitions })
        })
    })
})

// TODO: Add hasAccess flag
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

// Get all users information
// TODO: deprecated

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
// TODO: deprecated

router.route('/users/:user').put((req, res) => {
  const { name, surname, company, username, email } = req.body
  const { user } = req.params
  if (!name || !surname || !company || !username || !email) return res.status(400).json({ error: { message: 'Malformed request' } })
  return User.findOneAndUpdate(
    { username: user },
    { $set: { name, surname, company, username, email } }
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
// TODO: deprecated

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

// deactivate user
// TODO: deprecated
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
// TODO: deprecated
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
// TODO: deprecated
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

// TODO: deprecated
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
    const { name, surname, username, email } = req.body
    const { adminUsername } = req.params

    if (!name || !surname || !username || !email) return res.status(400).json({ error: { message: 'Malformed request' } })
    return Admin.findOneAndUpdate(
      { username: adminUsername },
      { $set: { name, surname, username, email } }
    ).exec((error, admin) => {
      if (error) {
        console.error('Could not update admin information')
        return res.status(500).json({ error: { message: 'Could not update admin information' } })
      }
      if (!admin) return res.status(404).json({ success: false, message: 'Admin specified not found' })
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

// TODO: deprecated
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

// TODO: deprecated
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
// TODO: deprecated
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
// TODO: deprecated
router.route('/rates').get(async (req, res) => {
  const { username } = req._user
  try {
    const rates = await User.findOne({ username }).select('searchRates indexRates')

    return res.status(200).json({ rates })
  } catch (error) {
    console.error('Could not get rates', error)
    return res.status(500).json({ error: { message: 'Could not get rates' } })
  }
})

// Edit in bulk all rates (this is the UX stablished in the mocks)
// TODO: deprecated
router.route('/rates').post(async (req, res) => {
  const { username } = req._user
  const { searchRates, indexRates } = req.body
  if (!searchRates || !indexRates || searchRates.length === 0 || indexRates.length === 0) return res.status(400).json({ error: { message: 'Malformed Request' } })
  try {
    // Validate that searchRates and indexRates are well formed
    if (searchRates[0].min > 0 || indexRates[0].min > 0) return res.status(403).json({ error: { message: 'Cannot insert a search invalid rate' } })

    for (let index = 1; index < searchRates.length; index += 1) {
      if (searchRates[index].min !== searchRates[index - 1].max + 1) return res.status(403).json({ error: { message: 'Cannot insert a search invalid rate' } })
    }

    for (let index = 1; index < indexRates.length; index += 1) {
      if (indexRates[index].min !== indexRates[index - 1].max + 1) return res.status(403).json({ error: { message: 'Cannot insert an search invalid rate' } })
    }

    await User.findOneAndUpdate({ username }, { $set: { indexRates, searchRates } })
    return res.status(200).json({ success: true, message: 'Successfully updated rates' })
  } catch (error) {
    console.error('Could not update rates', error)
    return res.status(500).json({ error: { message: 'Could not update rates' } })
  }
})

// Add new search rate
// TODO: deprecated
router.route('/rates/search').post(async (req, res) => {
  const { username } = req._user
  const { min, max, cost } = req.body
  const rate = { min: parseInt(min, 10), max: parseInt(max, 10), cost }
  if (!min || !max || !cost || rate.min > rate.max) return res.status(400).json({ error: { message: 'Malformed request' } })
  try {
    const { searchRates } = await User.findOne({ username }).select('searchRates')
    // If min is less than then
    searchRates.sort(($0, $1) => {
      return $0.min - $1.min
    })
    // Valid case for insert only
    if (
      (rate.min < searchRates[0].min && rate.max < searchRates[0].min) ||
      rate.min === searchRates[searchRates.length - 1].max + 1
    ) {
      await User.findOneAndUpdate({ username }, { $push: { searchRates: rate } })
      return res.status(200).json({ success: true, message: 'Successfully added search rate' })
    }
    return res.status(403).json({ error: { message: 'Cannot insert an search invalid rate' } })
  } catch (error) {
    console.error('Could not add search rate', error)
    return res.status(500).json({ error: { message: 'Could not add search rate' } })
  }
})

// Add new index rate
// TODO: deprecated
router.route('/rates/index').post(async (req, res) => {
  const { username } = req._user
  const { min, max, cost } = req.body
  const rate = { min: parseInt(min, 10), max: parseInt(max, 10), cost }
  if (!min || !max || !cost || rate.min > rate.max) return res.status(400).json({ error: { message: 'Malformed request' } })
  try {
    const { indexRates } = await User.findOne({ username }).select('indexRates')
    // If min is less than then
    indexRates.sort(($0, $1) => {
      return $0.min - $1.min
    })
    // Valid case for insert only
    if (
      (rate.min < indexRates[0].min && rate.max < indexRates[0].min) ||
      rate.min === indexRates[indexRates.length - 1].max + 1
    ) {
      await User.findOneAndUpdate({ username }, { $push: { indexRates: rate } })
      return res.status(200).json({ success: true, message: 'Successfully added index rate' })
    }
    return res.status(403).json({ error: { message: 'Cannot insert an invalid index rate' } })
  } catch (error) {
    console.error('Could not add search rate', error)
    return res.status(500).json({ error: { message: 'Could not add index rate' } })
  }
})

// Delete search rate
// TODO: deprecated
router.route('/rates/search/:rateId').delete(async (req, res) => {
  const { username } = req._user
  const _id = req.params.rateId
  try {
    await User.findOneAndUpdate({ username }, { $pull: { searchRates: { _id } } })
    return res.status(200).json({ success: true, message: 'Successfully deleted search rate' })
  } catch (error) {
    console.error('Could not delete search rate', error)
    return res.status(500).json({ error: { message: 'Could not delete search rate' } })
  }
})

// Delete index rate
// TODO: deprecated
router.route('/rates/index/:rateId').delete(async (req, res) => {
  const { username } = req._user
  const _id = req.params.rateId
  try {
    await User.findOneAndUpdate({ username }, { $pull: { indexRates: { _id } } })
    return res.status(200).json({ success: true, message: 'Successfully deleted index rate' })
  } catch (error) {
    console.error('Could not delete index rate', error)
    return res.status(500).json({ error: { message: 'Could not delete index rate' } })
  }
})

module.exports = router
