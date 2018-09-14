/* eslint-env node */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  url: String,
  name: String,
  category: String,
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
})

module.exports = mongoose.model('Item', schema)
module.exports.ItemSchema = mongoose.model('Item', schema).schema
