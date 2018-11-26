/* eslint-env node */
const path = require('path')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { ItemSchema } = require(path.resolve('models/Item'))

const Rate = new Schema({
  min: Number,
  max: Number,
  cost: { type: Number, default: 0 },
})

const IndexedImage = new Schema({
  url: String,
  name: String,
  id: Number,
  sku: Number,
  key: String,
  timestamp: { type: Number, default: Date.now },
})

const schema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: String,
  company: String,
  password: { type: String, required: true },
  searchRates: {
    type: [Rate],
    default: [{ _id: mongoose.Types.ObjectId(), min: 1, max: 1000, cost: 1 }],
  },
  indexRates: {
    type: [Rate],
    default: [{ _id: mongoose.Types.ObjectId(), min: 1, max: 1000, cost: 1 }],
  },
  isIndexing: { type: Boolean, default: false },
  apiKey: {
    value: String,
    active: Boolean,
  },
  active: { type: Boolean, default: true },
  indexLimit: Number,
  searchLimit: Number,
  aceptanceRate: Number,
  photo: String,
  indexings: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Indexing' }],
    default: [],
  },
  toIndex: {
    type: [IndexedImage],
    default: [],
  },
  searches: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Searching' }],
    default: [],
  },
  items: { type: [ItemSchema], default: [] },
  indexedImages: { type: [IndexedImage], default: [] },
})

module.exports = mongoose.model('User', schema)
