'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  link: {type: String, required: true},
  linkHistory: [{
    link: String,
    modifyDate: {type: Date, required: true, default: Date.now}
  }],
  collectionName: {type: String, required: true},
  resourceId: {type: mongoose.Schema.Types.ObjectId, required: true},

  keywordGroup: {
    _id: mongoose.Schema.Types.ObjectId,
    keywords: String
  },


  site: {
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    domain: String
  },
  removed: {type: Date},
  createDate: {type: Date, required: true, default: Date.now}
}, {
  strict: true,
  safe: true,
  collection: 'seoUrls'
});

module.exports = mongoose.model('SeoUrl', schema);
