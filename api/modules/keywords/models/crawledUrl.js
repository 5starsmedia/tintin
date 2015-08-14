'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  url: {type: String, required: true},
  content: {type: String, required: true},
  code: Number,
  encoding: String,

  title: String,
  text: String,

  createDate: {type: Date, required: true, default: Date.now},

  removed: {type: Date}
}, {
  strict: true,
  safe: true,
  collection: 'crawledUrls'
});

module.exports = mongoose.model('CrawledUrl', schema);
