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
  code: String,

  variationTitle: String,

  createDate: {type: Date, required: true, default: Date.now},

  removed: {type: Date},

  isPublished: {type: Boolean, required: true, default: false},

  isLatest: {type: Boolean, required: true, default: false},
  isDiscount: {type: Boolean, required: true, default: false},
  isCanOrder: {type: Boolean, required: true, default: false},
  isHit: {type: Boolean, required: true, default: false},

  isInStock: Boolean,
  inStockCount: {type: Number, required: true, default: 0},
  ordinal: {type: Number, required: true, default: 0},

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
      isHidden: Boolean,
      ordinal: Number
    }
  ],

  relatedProducts: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      title: String
    }
  ],

  isVariation: {type: Boolean, required: true, default: false},
  withVariations: {type: Boolean, required: true, default: false},
  variationProduct:{
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    coverFile: {
      _id: mongoose.Schema.Types.ObjectId
    }
  },
  variationCount: {type: Number, required: true, default: 0},
  productVariations: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      title: String,
      variationTitle: String,
      coverFile: {
        _id: mongoose.Schema.Types.ObjectId
      },
      price: {type: Number, required: true, default: 0},
      code: String,
      isInStock: Boolean,
      inStockCount: Number,
      isPublished: Boolean
    }
  ],

  category: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    alias: String
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
  brand: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },
  productType: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },
  site: {
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    domain: String
  },
  tags: [{title: String}]
}, {
  strict: true,
  safe: true,
  collection: 'products'
});

schema.index({id: 1});
schema.index({createDate: 1});

module.exports = mongoose.model('Product', schema);
