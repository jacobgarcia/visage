import axios from 'axios'
let baseUrl = 'http://localhost:8081'
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
    return axios.get(`${baseUrl}/v1/private/users/self`)
  }
  /*
  L O G I N
  */

  static login({email, password}) {
    return axios.post(`${baseUrl}/v1/private/authenticate`, {email, password})
  }
  /*
  S I G N   U P
  */
  static signup(invitation,{email, password, username, fullName}) {
    return axios.post(`${baseUrl}/v1/private/signup/${invitation}`, {email, password, username, fullName})
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
    return axios.post(`${baseUrl}/v1/private/users/invite`,data)
  }

  static updateClient(data) {
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
    return axios.post(`${baseUrl}/v1/private/users/invite`,{email})
  }

  /*
  R A T E S
  */
  static setRates(data) {
    return axios.put(`${baseUrl}/v1/private/rates`, data)
  }
}

export default NetworkOperation
