'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  createDate: {type: Date, required: true, default: Date.now},
  modifyDate: {type: Date},
  removed: {type: Date},
  collectionName: String,
  resourceId: mongoose.Schema.Types.ObjectId,
  sitemap: {
    _id: mongoose.Schema.Types.ObjectId
  },
  loc: {type: String, required: true},
  changefreq: {
    type: String,
    required: true,
    default: 'never',
    enum: ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
  },
  lastmod: {type: Date, required: true, default: Date.now},
  priority: {type: Number, required: true, default: 0.5},
  images: [
    {
      loc: {type: String, required: true},
      caption: String
    }
  ]
}, {
  strict: true,
  safe: true,
  collection: 'sitemapUrls',
  versionKey: false
});

schema.index({'sitemap._id': 1});

module.exports = mongoose.model('SitemapUrl', schema);
