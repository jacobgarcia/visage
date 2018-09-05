/* eslint-env node */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  timestamp: { type: Number, default: Date.now },
  response: Object,
  request: {
    body: Object
  },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
})

schema.virtual('success').get(() => {
  return `${this.response.status}`
})

module.exports = mongoose.model('Indexing', schema)
