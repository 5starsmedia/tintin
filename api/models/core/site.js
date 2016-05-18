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

  defaultLocale: {type: String, required: true, default: 'en_GB'},
  allowLocales: [{
    title: String,
    code: String
  }],

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
    youtubeUser: String,
    youtubeChannel: String,
    subscribeChannel: String,
    vkGroupId: String,
    fbGroupId: String,
    fbPageId: String,
    googleAnalytics: String,
    yandexMetrika: String,
    homepageTitle: String,
    moeVideoPin: String,
    moeVideoPinOnlyDesktop: Boolean,
    structureLevel: {type: Number, required: true, default: 2},

    commenterAvatar: {
      _id: mongoose.Schema.Types.ObjectId
    },
    headCode: String,
    issuePrefix: String
  },

  tz: {
    defaultText: String
  },

  yandexXml: String,
  yandexCName: String,
  yandexWebmasterTxt: String,
  
  googleWebmasterTxt: String,

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
