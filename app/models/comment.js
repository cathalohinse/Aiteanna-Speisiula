'use strict';
const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const commentSchema = Schema({
  commentBody: String,
  poi: {
    type: Schema.Types.ObjectId,
    ref: 'Poi',
  },
  commenter: {
    type: Schema.Types.ObjectId,
    ref: "User",
  }
});

module.exports = Mongoose.model('Comment', commentSchema);