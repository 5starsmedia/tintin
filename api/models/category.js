/**
 * Copyright 2015 5starsmedia.com.ua
 *
 * lib/server/models/core/account.js
 * Account mongoose model
 */
'use strict';

var mongoose = require('mongoose'),
  materializedPlugin = require('mongoose-materialized');

var schema = new mongoose.Schema({
  id: {type: Number, required: true, default: 0},

  // Назва
  title: {type: String, required: true},
  alias: String,
  description: String,

  createDate: {type: Date, required: true, default: Date.now},

  coverFile: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },
  files: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      title: String
    }
  ],

  removed: {type: Date},
  site: {
    _id: mongoose.Schema.Types.ObjectId,
    domain: String
  }
}, {
  strict: true,
  safe: true,
  collection: 'categories'
});

schema.plugin(materializedPlugin);

module.exports = mongoose.model('Category', schema);
