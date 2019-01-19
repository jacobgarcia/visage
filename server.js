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
const isProd = mode === 'production'

// MARK: Environment variables setup
dotenv.config({ path: path.resolve(`config/.env.${mode}`) })

// MARK: Environment variables definition
const {
  PORT = 8080,
  DASHBOARD_SERV,
  DB_URI,
  API_SERV = true,
  API_URL,
} = process.env

// Important to load all after dotenv config
const v1 = require(path.resolve('router/v1'))

// MARK: DB Connection
mongoose
  .connect(
    DB_URI,
    { useNewUrlParser: true, dbName: 'visual-search', useCreateIndex: true }
  )
  .then(() => logger.info('-- Connected to DB 🍃 --'))
  .catch(() => logger.error('-- ❌ Could not connect to DB --'))

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
if (!isProd && DASHBOARD_SERV === 'true') {
  app.use(require(path.resolve('config/webpackDevServer')))
}
if (isProd && DASHBOARD_SERV === 'true') {
  app.use(express.static(path.resolve('dist')))
  app.get('*', (req, res) => res.sendFile(path.resolve('dist/index.html')))
}

// Server
app.listen(PORT, () =>
  console.info(`
Visual search is now running\n
🕳  Port: \t${PORT}
👾  Server: \t${API_SERV}
📊  Dashboard: \t${DASHBOARD_SERV}
⚙️  API_URL: \t${API_URL}
🍃  DB_URL: \t${DB_URI}
✅  Mode: \t${mode}`)
)
