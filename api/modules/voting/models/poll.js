'use strict';

var mongoose = require('mongoose'),
  choiceSchema = require('./choise.js');

var schema = new mongoose.Schema({
  title: {type: String, required: true},
  alias: String,

  body: {type: String, required: true},

  meta: {
    title: String,
    keywords: String,
    description: String
  },

  choices: [choiceSchema],

  viewsCount: {type: Number, required: true, default: 0},
  createDate: {type: Date, required: true, default: Date.now},
  removed: {type: Date},

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
  ],
  site: {
    _id: mongoose.Schema.Types.ObjectId,
    domain: String
  }
}, {
  strict: true,
  safe: true,
  collection: 'polls'
});

schema.index({createDate: 1});

module.exports = mongoose.model('Poll', schema);
