/* eslint-env node */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Rate = new Schema({
  min: Number,
  max: Number,
  cost: { type: Number, defualt: 0 }
})

const schema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: String,
  surname: String,
  username: { type: String, required: true, unique: true, index: true },
  company: String,
  password: { type: String, required: true },
  searchRates: { type: [Rate], default: [] },
  indexRates: { type: [Rate], default: [] },
  indexStatus: String,
  apiKey: {
    value: String,
    active: Boolean
  },
  active: Boolean,
  indexLimit: Number,
  searchLimit: Number,
  aceptanceRate: Number,
  photo: String
})

schema.virtual('fullname').get(() => {
  return `${this.name} ${this.surname}`
})

module.exports = mongoose.model('User', schema)
