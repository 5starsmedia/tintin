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

  id: Number,
  title: {type: String, required: true},
  alias: String,
  body: String,

  createDate: {type: Date, required: true, default: Date.now},

  removed: {type: Date},

  isPublished: Boolean,

  viewsCount: {type: Number, required: true, default: 0},
  likesCount: {
    facebook: {type: Number, required: true, default: 0},
    vk: {type: Number, required: true, default: 0},
    twitter: {type: Number, required: true, default: 0}
  },

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
  },
  tags: [{title: String}],


  translates: {
    title: {
      'uk-UA': String,
      'ru-RU': String,
      'en-GB': String
    },
    body: {
      'uk-UA': String,
      'ru-RU': String,
      'en-GB': String
    }
  },

}, {
  strict: true,
  safe: true,
  collection: 'productCategories'
});

schema.index({createDate: 1});
schema.plugin(materializedPlugin);

module.exports = mongoose.model('ProductCategory', schema);
