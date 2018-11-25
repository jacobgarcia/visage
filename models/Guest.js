/* eslint-env node */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  name: String,
  surname: String,
  username: String,
  email: { type: String, required: true, unique: true, index: true },
  company: String,
  password: String,
  invitation: { type: String, required: true, unique: true },
  host: { type: Schema.Types.ObjectId, ref: 'User' },
})

module.exports = mongoose.model('Guest', schema)
