/**
 * Copyright 2015 5starsmedia.com.ua
 *
 * lib/server/models/core/account.js
 * Account mongoose model
 */
'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({

  id: Number,
  title: {type: String, required: true},
  alias: String,
  body: String,

  createDate: {type: Date, required: true, default: Date.now},

  removed: {type: Date},

  isPublished: Boolean,

  coverFile: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },
  files: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      title: String,
      ordinal: Number
    }
  ],
  site: {
    _id: mongoose.Schema.Types.ObjectId,
    domain: String
  }
}, {
  strict: true,
  safe: true,
  collection: 'productBrands'
});

schema.index({createDate: 1});

module.exports = mongoose.model('ProductBrand', schema);
