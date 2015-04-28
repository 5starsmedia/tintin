'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  // Назва
  title: {type: String, required: true},
  keywords: {type: String, required: true},

  project: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },
  createDate: {type: Date, required: true, default: Date.now},

  removed: {type: Date}
}, {
  strict: true,
  safe: true,
  collection: 'keywordGroups'
});

module.exports = mongoose.model('KeywordGroup', schema);
