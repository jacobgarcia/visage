const path = require('path')
const axios = require('axios')
const dotenv = require('dotenv')

if (new Date().getHours() !== 0) {
  console.log(`Current hours is ${new Date().getHours()}, not running.`)
  process.exit(0)
}

dotenv.config({ path: path.resolve('config/.env/.production') })

const URL = process.env.API_URL

axios.interceptors.request.use(
  (config) => {
    config.headers.Authorization =
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmYzMmU5NmE2MDI5MTJlOWFmMzdkY2IiLCJhY2MiOiJ1c2VyIiwiY21wIjoiTnVyZSIsImlhdCI6MTU0MzE5MTM0OH0.8XCLT-C-YAsk38luk16DXV1Opa7-RJrw03MurBpXl6Q'

    return config
  },
  (error) => Promise.reject(error)
)

const requestHandler = async () => {
  try {
    await axios.post(`${URL}/v1/private/images/index`)

    console.info('Daily batch process initialized')
  } catch (error) {
    console.error(error)
  }
}

requestHandler()
