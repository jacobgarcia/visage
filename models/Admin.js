/* eslint-env node */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: String,
  surname: String,
  username: String,
  company: String,
  password: String,
  services: [String],
  superAdmin: Boolean
})

schema.virtual('fullname').get(() => {
  return `${this.name} ${this.surname}`
})

module.exports = mongoose.model('Admin', schema)
