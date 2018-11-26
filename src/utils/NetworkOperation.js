import axios from 'axios'
let baseUrl = 'http://localhost:8080'
// baseUrl = 'https://4b0490a5.ngrok.io'
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
  static getSelf() {
    return axios.get(`${baseUrl}/v1/dashboard/self`)
  }
  /*
  LOGIN
  */

  static login({email, password}) {
    return axios.post(`${baseUrl}/v1/dashboard/authenticate`, {email, password})
  }
  /*
  Signup
  */
  static self(invitation,{email, password, username, fullName}) {
    return axios.get(`${baseUrl}/v1/dashboard/signup/${invitation}`, {email, password, username, fullName})
  }

  static self() {
    return axios.get(`${baseUrl}/v1/dashboard/self`)
  }

  static generateAPIToken(username) {
    return axios.post(`${baseUrl}/v1/dashboard/token/generate/${username}`)
  }


  /*
  T A R I F S
  */

  static getRates() {
    return axios.get(`${baseUrl}/v1/dashboard/rates`)
  }

  /*
  U S E R S
  */

  static getUsers() {
    return axios.get(`${baseUrl}/v1/dashboard/users`)
  }

  static deactivateUser(username) {
    return axios.patch(`${baseUrl}/v1/dashboard/users/${username}/deactivate`)
  }

  /*
  A D M I N S
  */

  static getAdmins() {
    return axios.get(`${baseUrl}/v1/dashboard/admins`)
  }

  static deleteAdmin(username) {
    return axios.delete(`${baseUrl}/v1/dashboard/admins/${username}`)
  }

  static updateAdmin(admin) {
    return axios.put(`${baseUrl}/v1/dashboard/admins/${admin.username}`, admin)
  }

  /*
  A P I   K E Y S
  */

  static revokeAPIKey(username) {
    return axios.post(`${baseUrl}/v1/dashboard/token/revoke/${username}`)
  }

  static renewAPIKey(username) {
    return axios.post(`${baseUrl}/v1/dashboard/token/renew/${username}`)
  }

  static generateAPIKey(username) {
    return axios.post(`${baseUrl}/v1/dashboard/token/generate/${username}`)
  }
}

export default NetworkOperation
