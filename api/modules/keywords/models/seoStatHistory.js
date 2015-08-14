'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  url: {
    _id: mongoose.Schema.Types.ObjectId,
    link: String,
    collectionName: {type: String, required: true},
    resourceId: {type: mongoose.Schema.Types.ObjectId, required: true}
  },
  keyword: String,

  metrik: String,
  value: Number,

  site: {
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    domain: String
  },
  createDate: {type: Date, required: true, default: Date.now}
}, {
  strict: true,
  safe: true,
  collection: 'seoStatHistories'
});

module.exports = mongoose.model('SeoStatHistory', schema);
