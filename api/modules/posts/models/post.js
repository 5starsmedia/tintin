'use strict';

var mongoose = require('mongoose'),
  autoIncrement = require("../../../models/plugin/autoincrement.js"),
  createdBy = require("../../../models/plugin/createdBy.js"),
  mongooseHistory = require('historical'),
    pageSection = require('./pageSection.js');

var schema = new mongoose.Schema({
  id: Number,

  // тип публікації
  postType: {type: String, default: 'news', enum: ['news', 'post', 'page', 'announce']},
  // Назва
  title: {type: String, required: true},
  alias: String,
  // Короткий опис
  teaser: String,
  // Текст
  body: String,
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

  attributes:  mongoose.Schema.Types.Mixed,

  status: {type: Number, required: true, default: 0},
  // 7 Failed moderation
  // 6 Deferred publication
  // 5 Wait system moderation
  // 4 Published
  // 3 System moderation
  // 2 On moderation
  // 1 Draft

  viewsCount: {type: Number, required: true, default: 0},
  likesCount: {
    facebook: {type: Number, required: true, default: 0},
    vk: {type: Number, required: true, default: 0},
    twitter: {type: Number, required: true, default: 0}
  },
  commentsCount: {type: Number, required: true, default: 0},

  isTop: Boolean,
  isHighlight: Boolean,
  isEditorChoose: Boolean,
  hasPhotoreport: Boolean,
  isInterview: Boolean,
  isBlog: Boolean,
  isAdvertising: Boolean,
  isPoliticalAdvertising: Boolean,

  poll: {
    _id: mongoose.Schema.Types.ObjectId
  },

  ownPhoto: Boolean,
  isAllowComments: Boolean,

  editorNotes: String,
  extModerationId: String,
  extCheckResult: mongoose.Schema.Types.Mixed,
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


  sections: [pageSection.schema],

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

schema.index({createDate: 1});

schema.plugin(createdBy);
schema.plugin(mongooseHistory, { mongoose: mongoose });

module.exports = mongoose.model('Post', schema);
