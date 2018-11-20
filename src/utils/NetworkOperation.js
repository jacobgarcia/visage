import axios from 'axios'

const baseUrl = 'http://localhost:8080'

axios.interceptors.request.use(
  (config) => {
    config.headers.Authorization =
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmI5MzI5YTY3NDRhMjk1MmRhZGY0YjciLCJlbWFpbCI6Im1hcmlvQG51cmUubXgiLCJ1c2VybmFtZSI6Im1hcmlvZ2FyY2lhIiwiaWF0IjoxNTQyMzgwNjY1fQ.K6cqDFokwbe733RgknYSKDhFD9RetOtM6pShO1Lfabk'
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

class NetworkOperation {
  /*
  LOGIN
  */
  static login({email, password}) {
    return axios.post(`${baseUrl}/v1/dashboard/authenticate`, {email, password})
  }

  static generateAPIToken(username) {
    return axios.post(`${baseUrl}/v1/dashboard/token/generate/${username}`)
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

  static updateAdmin({ username, ...admin }) {
    return axios.put(`${baseUrl}/v1/dashboard/admins/${username}`, admin)
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
