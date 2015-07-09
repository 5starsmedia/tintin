'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  // Назва
  title: {type: String, required: true},
  keywords: {type: String, required: true},

  status: {type: String, default: 'new', enum: [
    'new',
    'inprocess',
    'scaned',
    'finded',
    'completed',
    'inwork' // видно у редактора
  ]},

  project: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },
  createDate: {type: Date, required: true, default: Date.now},

  result: {
    text: String,
    account: {
      _id: mongoose.Schema.Types.ObjectId,
      title: String
    },
    dueDate: Date,
    urls: [{
      url: String,
      count: Number,
      use: Boolean
    }],
    additionalsWords: [{
      _id: mongoose.Schema.Types.ObjectId,
      word: String,
      use: Boolean
    }]
  },
  recomendation: {
    minTextLength: Number,
    maxTextLength: Number,
    keywords: [{
      keyword: String,
      entry: Number,
      entryInTop3: Number,
      useEntry: Number,
      required: Boolean,
      useType: {type: String}//, default: 'both', enum: ['both', 'exact', 'inexact']}
    }]
  },
  scanResult: {
    lastDate: Date,
    keywords: [{
      title: String,
      yandexScanResult: String,
      sites: [{
        site: String,
        additionalsWords: [{ word: String, stem: String }],
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
