/**
 * Copyright 2015 5starsmedia.com.ua
 *
 * lib/server/models/core/account.js
 * Account mongoose model
 */
'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  title: {type: String, required: true},
  alias: String,

  ordinal: Number,

  fieldType: {type: String, default: 'checkbox', enum: ['checkbox', 'text', 'number', 'list', 'checkbox-list', 'separator']},
  fieldData: [
    {
      title: String,
      ordinal: Number
    }
  ],

  isRequired: Boolean,
  isFilter: Boolean,
  isPublished: Boolean,

  productType: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },

  // service
  createDate: {type: Date, required: true, default: Date.now},
  removed: {type: Date},
  site: {
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    domain: String
  }
}, {
  strict: true,
  safe: true,
  collection: 'productFields'
});

schema.index({createDate: 1});

module.exports = mongoose.model('ProductField', schema);
