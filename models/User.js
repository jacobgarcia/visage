/* eslint-env node */
const path = require('path')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { IndexingSchema } = require(path.resolve('models/Indexing'))
const { SearchingSchema } = require(path.resolve('models/Searching'))
const { ItemSchema } = require(path.resolve('models/Item'))

const Rate = new Schema({
  min: Number,
  max: Number,
  cost: { type: Number, default: 0 }
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
  photo: String,
  indexings: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Indexing' }],
    default: []
  },
  searches: { type: [SearchingSchema], default: [] },
  items: { type: [ItemSchema], default: [] }
})

schema.virtual('fullname').get(() => {
  return `${this.name} ${this.surname}`
})

module.exports = mongoose.model('User', schema)
