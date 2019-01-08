const path = require('path')
const request = require('request')
const winston = require('winston')
const mongoose = require('mongoose')

const User = require(path.resolve('models/User'))

/* Winston logger object */
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logfile.log' }),
  ],
})
// MARK: Environment variables definition
const { DB_URI, API_URL } = process.env
// MARK: DB Connection
mongoose
  .connect(
    DB_URI,
    { useNewUrlParser: true, dbName: 'visual-search', useCreateIndex: true }
  )
  .then(() => logger.info('Connected to DB'))
  .catch(() => logger.error('\n|\n|  Could not connect to DB\n|'))

User.find({}).exec((error, users) => {
  if (error) {
    winston.error(error)
  }
  return users.map((user) => {
    request.get(`${API_URL}/images/index/${user}`, (error, res) => {
      if (error) {
        winston.error(error)
      }
      if (res.statusCode === 200) {
        winston.info('Daily Update')
      }
    })
  })
})
