/**
 * Copyright 2015 5starsmedia.com.ua
 *
 * lib/server/models/person/gender.js
 * Gender mongoose model
 */
'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  title: {type: String, required: true},
  createDate: {type: Date, required: true, default: Date.now},
  modifyDate: {type: Date},
  removed: {type: Date},
  cssClass: {type: String, required: true}
}, {
  strict: true,
  safe: true,
  collection: 'genders'
});

module.exports = mongoose.model('Gender', schema);
