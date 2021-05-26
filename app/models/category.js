'use strict';
const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const categorySchema = new Schema({
  county: String,
  province: String,
});

module.exports = Mongoose.model('Category', categorySchema);