'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  // Назва
  title: {type: String, required: true},
  internalCode: String,

  createDate: {type: Date, required: true, default: Date.now},

  removed: {type: Date}
}, {
  strict: true,
  safe: true,
  collection: 'keywordProjects'
});

module.exports = mongoose.model('KeywordProject', schema);
