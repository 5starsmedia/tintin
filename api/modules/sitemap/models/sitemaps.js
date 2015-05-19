'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  createDate: {type: Date, required: true, default: Date.now},
  modifyDate: {type: Date},
  removed: {type: Date},
  isPublished: {type: Boolean, required: true, default: false},
  urlsCount: {type: Number, required: true, default: 0}
}, {
  strict: true,
  safe: true,
  collection: 'sitemaps',
  versionKey: false
});

module.exports = mongoose.model('Sitemap', schema);
