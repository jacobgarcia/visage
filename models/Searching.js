/* eslint-env node */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Item = new Schema({
  id: Number,
  sku: String,
  similarity: Number,
  cl: String,
  score: Number,
})

const schema = new Schema({
  timestamp: { type: Number, default: Date.now },
  response: {
    success: Boolean,
    status: Number,
    items: { type: [Item], default: [] },
  },
  request: {
    route: Object,
    file: Object,
    token: String,
    headers: Object,
  },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
})

schema.virtual('success').get(() => {
  return `${this.response.status}`
})

module.exports = mongoose.model('Searching', schema)
module.exports.SearchingSchema = mongoose.model('Searching', schema).schema
