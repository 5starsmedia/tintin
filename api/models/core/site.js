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
  title: String,

  isHttps: Boolean,
  isCorsEnabled: Boolean,

  removed: {type: Date},
  createDate: {type: Date, required: true, default: Date.now},
  site: {
    _id: mongoose.Schema.Types.ObjectId,
    domain: String
  }
}, {
  strict: true,
  safe: true,
  collection: 'sites'
});

schema.index({domain: 1}, {unique: true});

module.exports = mongoose.model('Site', schema);
