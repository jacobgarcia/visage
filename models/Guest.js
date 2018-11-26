/* eslint-env node */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  name: String,
  username: String,
  email: { type: String, required: true, unique: true, index: true },
  company: String,
  password: String,
  services: {
    dashboard: Boolean,
    clients: {type: Number, enum: [0,1,2]},
    admins: {type: Number, enum: [0,1,2]},
    rates: Boolean,
  },
  invitation: { type: String, required: true, unique: true },
  host: { type: Schema.Types.ObjectId, ref: 'User' },
})

module.exports = mongoose.model('Guest', schema)
