'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  // Назва
  title: {type: String, required: true},
  keywords: {type: String, required: true},

  status: {type: String, default: 'new', enum: ['new', 'inprocess', 'scaned', 'completed']},

  project: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },
  createDate: {type: Date, required: true, default: Date.now},

  result: {
    urls: [{
      url: String,
      count: Number
    }],
    additionalsWords: [{ word: String }]
  },
  scanResult: {
    lastDate: Date,
    keywords: [{
      title: String,
      yandexScanResult: String,
      sites: [{
        site: String,
        additionalsWords: [{ word: String }],
        url: String
      }]
    }]
  },

  removed: {type: Date}
}, {
  strict: true,
  safe: true,
  collection: 'keywordGroups'
});

module.exports = mongoose.model('KeywordGroup', schema);
