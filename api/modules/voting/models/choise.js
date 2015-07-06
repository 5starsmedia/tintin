'use strict';

var mongoose = require('mongoose');

var voteSchema = require('./vote.js');

var schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: {type: String, required: true},
  body: String,

  voteCount: {type: Number, required: true, default: 0},

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