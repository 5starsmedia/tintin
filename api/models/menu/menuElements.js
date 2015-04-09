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

  title: {type: String, required: true},
  alias: String,
  url: String,

  createDate: {type: Date, required: true, default: Date.now},

  removed: {type: Date},

  isPublished: Boolean,

  site: {
    _id: mongoose.Schema.Types.ObjectId,
    domain: String
  },
  tags: [{title: String}]
}, {
  strict: true,
  safe: true,
  collection: 'menuElements'
});

schema.index({createDate: 1});
schema.plugin(materializedPlugin);

module.exports = mongoose.model('MenuElement', schema);
