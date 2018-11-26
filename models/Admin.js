/* eslint-env node */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: String,
  surname: String,
  username: String,
  company: String,
  services: {
    dashboard: Boolean,
    clients: {type: Number, enum: [0,1,2]},
    admins: {type: Number, enum: [0,1,2]},
    rates: Boolean,
  },
  password: String,
  superAdmin: Boolean,
  active: Boolean,
})

schema.virtual('fullname').get(() => {
  return `${this.name} ${this.surname}`
})

module.exports = mongoose.model('Admin', schema)
