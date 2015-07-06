/**
 * Copyright 2015 5starsmedia.com.ua
 *
 * lib/server/models/core/site.js
 * Site mongoose model
 */
'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  domain: {type: String, required: true},
  port: {type: Number, required: true, default: 80},

  title: String,

  isHttps: Boolean,
  isCorsEnabled: Boolean,

  meta: {
    title: String,
    keywords: String,
    description: String
  },

  article: {
    title: String,
    body: String
  },

  settings: {
    logo: {
      _id: mongoose.Schema.Types.ObjectId
    },
    youtubeChannel: String,
    subscribeChannel: String,
    vkGroupId: String,
    fbGroupId: String,
    googleAnalytics: String,
    yandexMetrika: String,
    homepageTitle: String,
    structureLevel: {type: Number, required: true, default: 2}
  },

  yandexXml: String,
  yandexCName: String,
  yandexWebmasterTxt: String,

  robotsTxt: { type: String, required: true, default: "User-agent: *\nAllow: /" },

  removed: {type: Date},
  createDate: {type: Date, required: true, default: Date.now}
}, {
  strict: true,
  safe: true,
  collection: 'sites'
});

schema.index({domain: 1}, {unique: true});

module.exports = mongoose.model('Site', schema);
