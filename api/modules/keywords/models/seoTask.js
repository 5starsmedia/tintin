'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  url: {
    _id: mongoose.Schema.Types.ObjectId,
    link: String,
    collectionName: {type: String, required: true},
    resourceId: {type: mongoose.Schema.Types.ObjectId, required: true}
  },
  keywords: [{
    required: Boolean,      // обов'язкове використання
    keyword: String,        // ключове слово
    useEntry: Number,       // кількість використань
    useType: {type: String} //, default: 'both', enum: ['both', 'exact', 'inexact']}
  }],

  status: {type: String, default: 'new', enum: ['new', 'inprocess', 'completed', 'errored']},

  action: {type: String, default: 'get-google-position', enum: [
    'get-google-position',
    'get-yandex-position',
    'get-analytics'
  ]},

  resultString: String,
  result:       mongoose.Schema.Types.Mixed,

  site: {
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    domain: String
  },
  createDate: {type: Date, required: true, default: Date.now}
}, {
  strict: true,
  safe: true,
  collection: 'seoTasks'
});

module.exports = mongoose.model('SeoTask', schema);
