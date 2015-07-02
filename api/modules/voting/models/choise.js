'use strict';

var mongoose = require('mongoose');

var voteSchema = new mongoose.Schema({
  ip: String,
  createDate: {type: Date, required: true, default: Date.now}
});

var schema = new mongoose.Schema({
  title: {type: String, required: true},
  body: String,

  votes: [voteSchema],

  coverFile: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },
  files: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      title: String,
      ordinal: Number
    }
  ]
});

schema.index({createDate: 1});

module.exports = schema;