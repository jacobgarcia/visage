/* eslint-env node */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: String,
  surname: String,
  username: String,
  company: String,
  password: String,
  indexings: [Object],
  searches: [Object],
  searchRate: Object,
  indexRate: Object,
  indexStatus: String,
  apiKey: Object,
  status: Boolean,
  indexLimit: Number,
  searchLimit: Number,
  aceptanceRate: Number,
  items: [Object],
  photo: String
});

module.exports = mongoose.model("User", schema);
