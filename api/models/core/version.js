/**
 * Copyright 2015 5starsmedia.com.ua
 *
 * lib/server/models/version.js
 * Version mongoose model
 */
'use strict';

var mongoose = require('mongoose');

var versionSchema = new mongoose.Schema({
  createDate: {type: Date, required: true, default: Date.now},
  version: {type: String, required: true},
  description: {type: String}
}, {
  strict: true,
  versionKey: false,
  safe: true,
  collection: 'versions'
});

module.exports = mongoose.model('Version', versionSchema);
