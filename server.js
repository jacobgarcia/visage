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
    `config/env/.env${isProduction ? '.production' : '.development'}`
  ),
})

// Important to load all after dotenv config
const v1 = require(path.resolve('router/v1'))

// MARK: Environment variables definition
const { PORT = 8080, DASHBOARD_SERV, DB_URI, API_SERV = true, API_URL} = process.env

// MARK: DB Connection
mongoose
  .connect(
    DB_URI,
    { useNewUrlParser: true, dbName: 'visual-search', useCreateIndex: true }
  )
  .then(() => logger.info('Connected to DB'))
  .catch(() => logger.error('Could not connect to DB'))

const app = express()

app.use(helmet())
app.use(hpp())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
if (API_SERV === 'true') {
  app.use('/v1', v1)
} else {
  logger.info('Api Will be down')
}
// Bundle state based on env
if (!isProduction && DASHBOARD_SERV === 'true') {
  app.use(require(path.resolve('config/webpackDevServer')))
}
if (isProduction && DASHBOARD_SERV === 'true') {
  app.use(express.static(path.resolve('dist')))
  app.get('*', (req, res) => res.sendFile(path.resolve('dist/index.html')))
}

// Server
app.listen(PORT, () =>
  console.info(`React boilerplate is now running\n
    Port: \t\t${PORT}
    Server: \t\t${API_SERV}
    Dashboard: \t${DASHBOARD_SERV}
    API_URL: \t\t${API_URL}
    DB_URL: \t\t${DB_URI}
    Mode: \t\t${mode}`)
)
