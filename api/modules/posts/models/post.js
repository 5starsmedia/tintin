'use strict';

var mongoose = require('mongoose'),
  autoIncrement = require("../../../models/plugin/autoincrement.js");

var postSchema = new mongoose.Schema({
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

  keywords: [
    {
      word: String,
      importance: Number
    }
  ],

  keywordGroup: {
    _id: mongoose.Schema.Types.ObjectId
  },

  seo: {
    yandex: Number,
    google: Number,
    lastUpdateDate: {type: Date},
    keywords: [{
      title: String,
      yandex: Number,
      google: Number
    }]
  },

  account: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    imageUrl: String,
    coverFile: {
      _id: mongoose.Schema.Types.ObjectId,
      title: String
    }
  },

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
      title: String,
      ordinal: Number
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

postSchema.index({createDate: 1});

module.exports = mongoose.model('Post', postSchema);
