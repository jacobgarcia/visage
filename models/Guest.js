/* eslint-env node */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  name: String,
  surname: String,
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  company: String,
  password: String,
  invitationToken: String,
  host: { type: Schema.Types.ObjectId, ref: 'User' }
})

module.exports = mongoose.model('Guest', schema)
