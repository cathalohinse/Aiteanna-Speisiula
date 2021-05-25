'use strict';
const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const messageSchema = new Schema({
  body: String,
  recipient: String,
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
  }
});

module.exports = Mongoose.model('Message', messageSchema);