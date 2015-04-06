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
  body: String,
  code: String,

  createDate: {type: Date, required: true, default: Date.now},

  removed: {type: Date},


  isPublished: Boolean,

  isLatest: Boolean,
  isDiscount: Boolean,
  isCanOrder: Boolean,
  isInStock: Boolean,
  isHit: Boolean,

  inStockCount: Number,
  ordinal: Number,

  price: {type: Number, required: true, default: 0},

  status: {type: Number, required: true, default: 0},

  viewsCount: {type: Number, required: true, default: 0},
  likesCount: {
    facebook: {type: Number, required: true, default: 0},
    vk: {type: Number, required: true, default: 0},
    twitter: {type: Number, required: true, default: 0}
  },


  productFields: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      title: String,
      value: mongoose.Schema.Types.Mixed,
      values: [{
        title: String,
        ordinal: Number
      }],
      fieldType: String,
      isFilled: Boolean,
      ordinal: Number
    }
  ],

  relatedProducts: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      title: String
    }
  ],

  category: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },
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
  brand: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },
  productType: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },
  site: {
    _id: mongoose.Schema.Types.ObjectId,
    domain: String
  },
  tags: [{title: String}]
}, {
  strict: true,
  safe: true,
  collection: 'products'
});

schema.index({createDate: 1});

module.exports = mongoose.model('Product', schema);
