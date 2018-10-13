import axios from 'axios'

const baseUrl = 'http://localhost:8080'

axios.interceptors.request.use(
  (config) => {
    config.headers.Authorization =
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YjljMDNjMjc5MGU4OGU3OWNiNmYzYTEiLCJlbWFpbCI6Im1hcmlvQG51cmUubXgiLCJ1c2VybmFtZSI6Im1hcmlvZ2FyY2lhIiwiaWF0IjoxNTM2OTUxMjcyfQ.4sqdo-bSBPRYD1MTCb6FMrWxcREAUCPNYnlWnTfxeos'
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

class NetworkOperation {
  static generateAPIToken(username) {
    return axios.post(`${baseUrl}/v1/token/generate/${username}`)
  }

  /*
  U S E R S
  */

  static getUsers() {
    return axios.get(`${baseUrl}/v1/users`)
  }

  /*
  A D M I N S
  */

  static getAdmins() {
    return axios.get(`${baseUrl}/v1/admins`)
  }

  static deleteAdmin(username) {
    return axios.delete(`${baseUrl}/v1/admins/${username}`)
  }

  static updateAdmin({ username, ...admin }) {
    return axios.put(`${baseUrl}/v1/admins/${username}`, admin)
  }
}

export default NetworkOperation
