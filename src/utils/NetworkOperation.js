import axios from 'axios'

let baseUrl = 'https://4b0490a5.ngrok.io'
if (process.env.NODE_ENV === 'development') {
  baseUrl = 'http://localhost:8080'
}

let token = null

function getToken() {
  token = localStorage.getItem('token')
  return token
}

axios.interceptors.request.use(
  (config) => {
    config.headers.Authorization = `Bearer ${token || getToken()}`
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

class NetworkOperation {
  static getUserRate(username) {
    return axios.get(`${baseUrl}/v1/private/stats/requests/${username}`)
  }

  static getRequestStats(from, to) {
    return axios.get(`${baseUrl}/v1/private/stats/requests`, {
      params: {
        start: from,
        end: to,
      },
    })
  }

  static getRequestDetailedStats(from, to) {
    return axios.get(`${baseUrl}/v1/private/stats/request/details`, {
      params: {
        start: from,
        end: to,
      },
    })
  }

  static getUserBillingStats(from, to) {
    return axios.get(`${baseUrl}/v1/private/stats/users/billing`, {
      params: {
        start: from,
        end: to,
      },
    })
  }

  static getClientRequestStats(username, from, to) {
    return axios.get(`${baseUrl}/v1/private/stats/requests/${username}`, {
      params: {
        start: from,
        end: to,
      },
    })
  }

  static getClientBillingStats(username, from, to) {
    return axios.get(`${baseUrl}/v1/private/stats/users/${username}/billing`, {
      params: {
        start: from,
        end: to,
      },
    })
  }

  static getSelf() {
    return axios.get(`${baseUrl}/v1/private/users/self`)
  }

  /*
  L O G I N
  */

  static login({ email, password }) {
    return axios.post(`${baseUrl}/v1/private/authenticate`, { email, password })
  }

  /*
  S I G N   U P
  */
  static signup(invitation, { email, password, username, fullName }) {
    return axios.post(`${baseUrl}/v1/private/signup/${invitation}`, {
      email,
      password,
      username,
      fullName,
    })
  }

  static generateAPIToken(username) {
    return axios.post(`${baseUrl}/v1/private/users/token/${username}`)
  }

  /*
  R A T E S
  */

  static getRates() {
    return axios.get(`${baseUrl}/v1/private/rates`)
  }

  /*
  C L I E N T S
  */

  static getUsers() {
    return axios.get(`${baseUrl}/v1/private/users`)
  }

  static deactivateUser(username) {
    return axios.patch(`${baseUrl}/v1/private/users/${username}/deactivate`)
  }

  static reactivateUser(username) {
    return axios.patch(`${baseUrl}/v1/private/users/${username}/activate`)
  }

  static inviteClient(data) {
    return axios.post(`${baseUrl}/v1/private/users/invite`, data)
  }

  static updateClient(data, oldUsername) {
    return axios.put(`${baseUrl}/v1/private/users/${oldUsername}`, data)
  }

  static deleteUser(username) {
    return axios.delete(`${baseUrl}/v1/private/users/${username}`)
  }

  static getApiToken() {
    return axios.get(`${baseUrl}/v1/private/users/token`)
  }
  static getTopSearches() {
    return axios.get(`${baseUrl}/v1/private/stats/searches/topsearches`)
  }

  static updatePassword(data) {
    return axios.patch(`${baseUrl}/v1/private/users/password`, data)
  }

  static exportUsers() {
    return axios.get(`${baseUrl}/v1/private/users/export`)
  }

  static setBillingInfo(data) {
    return axios.put(`${baseUrl}/v1/private/users/${data.username}`, data)
  }
  /*
  A D M I N S
  */

  static getAdmins() {
    return axios.get(`${baseUrl}/v1/private/admins`)
  }

  static createAdmin(data) {
    return axios.post(`${baseUrl}/v1/private/admins/invite`, data)
  }

  static deleteAdmin(username) {
    return axios.delete(`${baseUrl}/v1/private/admins/${username}`)
  }

  static updateAdmin(admin, oldUsername) {
    return axios.put(`${baseUrl}/v1/private/admins/${oldUsername}`, admin)
  }

  static exportAdmins() {
    return axios.get(`${baseUrl}/v1/private/admins/export`)
  }

  /*
  A P I   K E Y S
  */

  static revokeAPIKey(username) {
    return axios.patch(`${baseUrl}/v1/private/users/token/${username}`)
  }

  static renewAPIKey(username) {
    return axios.post(`${baseUrl}/v1/private/users/token/${username}`)
  }

  static generateAPIKey(username) {
    return axios.post(`${baseUrl}/v1/private/users/token/${username}`)
  }

  /*
  I N V I T E   U S E R
  */
  static inviteUser(email) {
    return axios.post(`${baseUrl}/v1/private/users/invite`, { email })
  }

  /*
  R A T E S
  */
  static setRates(data) {
    return axios.put(`${baseUrl}/v1/private/rates`, data)
  }

  /*
  I N D E X I N G
  */
  static indexImages(username) {
    return axios.post(`${baseUrl}/v1/private/images/index/${username}`)
  }
}

export default NetworkOperation
