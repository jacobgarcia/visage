/* eslint-env node */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  timestamp: { type: Number, default: Date.now },
  response: {
    success: Boolean,
    status: Number,
    features: Number
  },
  request: {
    route: Object,
    files: Object,
    token: String,
    headers: Object
  },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
})

module.exports = mongoose.model('Indexing', schema)
module.exports.SearchingSchema = mongoose.model('Indexing', schema).schema
