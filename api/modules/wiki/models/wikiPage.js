'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  // Назва
  title: {type: String, required: true},
  alias: String,
  // Текст
  body: {type: String, required: true},

  meta: {
    title: String,
    keywords: String,
    description: String
  },

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
  collection: 'wikiPages'
});

schema.index({createDate: 1});

module.exports = mongoose.model('WikiPage', schema);
