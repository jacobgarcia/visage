/* eslint-env node */
const path = require('path')
const express = require('express')
const helmet = require('helmet')
const hpp = require('hpp')
const winston = require('winston')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

/* Winston logger object */
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logfile.log' }),
  ],
})

const mode = process.env.NODE_ENV
const isProduction = mode === 'production'

// MARK: Environment variables setup
dotenv.config({
  path: path.resolve(
    `config/.env${isProduction ? '.production' : '.development'}`
  ),
})

// Important to load all after dotenv config
const v1 = require(path.resolve('router/v1'))

// MARK: Environment variables definition
const { PORT = 8080, SERVER_ONLY = false, DB_URI ,DASHBOARD_ONLY = false, API_URL} = process.env

// MARK: DB Connection
mongoose
  .connect(
    DB_URI,
    { useNewUrlParser: true, dbName: 'visual-search', useCreateIndex: true }
  )
  .then(() => logger.info('Connected to DB'))
  .catch(() => logger.error('\n|\n|  Could not connect to DB\n|'))

const app = express()

app.use(helmet())
app.use(hpp())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
if (!DASHBOARD_ONLY) app.use('/v1', v1)

// Bundle state based on env
if (!isProduction && !SERVER_ONLY) app.use(require(path.resolve('config/webpackDevServer')))
if (isProduction && !SERVER_ONLY) {
  app.use(express.static(path.resolve('dist')))
  app.get('*', (req, res) => res.sendFile(path.resolve('dist/index.html')))
}

// Server
app.listen(PORT, () =>
  console.info(`React boilerplate is now running\n
    Port: \t\t${PORT}
    Server only: \t${SERVER_ONLY}
    Dashboard only: \t${DASHBOARD_ONLY}
    API_URL: \t${API_URL}
    Mode: \t\t${mode}`)
)
