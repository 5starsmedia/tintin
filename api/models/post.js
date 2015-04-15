/**
 * Copyright 2015 5starsmedia.com.ua
 *
 * lib/server/models/core/account.js
 * Account mongoose model
 */
'use strict';

var mongoose = require('mongoose'),
  autoIncrement = require("./plugin/autoincrement.js");

var postSchema = new mongoose.Schema({
  id: Number,

  // тип публікації
  postType: {type: String, default: 'news', enum: ['news', 'post', 'page', 'announce']},
  // Назва
  title: {type: String, required: true},
  alias: String,
  // Короткий опис
  tizer: String,
  // Текст
  body: {type: String, required: true},
  // Дата публікації
  createDate: {type: Date, required: true, default: Date.now},
  // Дата зміни
  modifyDate: {type: Date},
  removed: {type: Date},
  // Дата публікації
  publishedDate: {type: Date},

  published: Boolean,

  source: String,
  photoSource: String,

  meta: {
    title: String,
    keywords: String,
    description: String
  },

  status: {type: Number, required: true, default: 0},

  viewsCount: {type: Number, required: true, default: 0},
  likesCount: {
    facebook: {type: Number, required: true, default: 0},
    vk: {type: Number, required: true, default: 0},
    twitter: {type: Number, required: true, default: 0}
  },
  commentsCount: {type: Number, required: true, default: 0},

  isTop: Boolean,
  isHighlight: Boolean,

  ownPhoto: Boolean,
  isAllowComments: Boolean,

  category: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    alias: String,
    parentAlias: String
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
  site: {
    _id: mongoose.Schema.Types.ObjectId,
    domain: String
  },
  tags: [{title: String}]
}, {
  strict: true,
  safe: true,
  collection: 'posts'
});

postSchema.index({id: 1}, {unique: true});
postSchema.index({createDate: 1});

//postSchema.plugin(autoIncrement.mongoosePlugin, {field: 'id'});

module.exports = mongoose.model('Post', postSchema);
