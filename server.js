/* eslint-env node */
const express = require('express')
const path = require('path')
const helmet = require('helmet') // Basic headers protection
const winston = require('winston')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const hpp = require('hpp')

const {
  databaseUri,
  project: { name }
} = require(path.resolve('config'))
const v1 = require(path.resolve('router/v1'))

const mode = process.env.NODE_ENV
const isProduction = mode === 'production'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logfile.log' })
  ]
})

dotenv.config({
  path: path.resolve(`config/.env${isProduction ? '.production' : '.development'}`)
})

const { PORT = 8080, SERVER_ONLY = false } = process.env

mongoose
  .connect(
    databaseUri,
    {
      useNewUrlParser: true
    }
  )
  .then(() => {
    logger.info('Connected to DB')
  })
  .catch(() => {
    logger.error('\n|\n|  Could not connect to DB\n|')
  })

const app = express()

app.use(helmet())
app.use(hpp())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/v1', v1)

if (!isProduction && !SERVER_ONLY) app.use(require(path.resolve('config/webpackDevServer')))
if (isProduction && !SERVER_ONLY) {
  app.use(express.static(path.resolve('dist')))
  app.get('*', (req, res) => res.sendFile(path.resolve('dist/index.html')))
}

// Start server
app.listen(PORT, () =>
  console.info(`React boilerplate is now running\n
    Port: \t\t${PORT}
    Server only: \t${SERVER_ONLY}
    Mode: \t\t${mode}`)
)
