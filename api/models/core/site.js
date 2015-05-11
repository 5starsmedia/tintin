/**
 * Copyright 2015 5starsmedia.com.ua
 *
 * lib/server/models/core/site.js
 * Site mongoose model
 */
'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  domain: {type: String, required: true},
  port: {type: Number, required: true, default: 80},

  title: String,

  isHttps: Boolean,
  isCorsEnabled: Boolean,

  meta: {
    title: String,
    keywords: String,
    description: String
  },

  article: {
    title: String,
    body: String
  },

  removed: {type: Date},
  createDate: {type: Date, required: true, default: Date.now}
}, {
  strict: true,
  safe: true,
  collection: 'sites'
});

schema.index({domain: 1}, {unique: true});

module.exports = mongoose.model('Site', schema);
