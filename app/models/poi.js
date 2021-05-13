"use strict";
const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const poiSchema = new Schema({
  name: String,
  location: String,
  latitude: Number,
  longitude: Number,
  image: Object,
  submitter: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
  },
});

module.exports = Mongoose.model("Poi", poiSchema);