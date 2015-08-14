'use strict';

var mongoose = require('mongoose'),
  autoIncrement = require("../../../models/plugin/autoincrement.js");

var schema = new mongoose.Schema({
  id: Number,

  // Назва
  title: {type: String, required: true},
  alias: String,
  // Короткий опис
  tizer: String,

  // Текст
  body: {type: String, required: true},

  // Дата публікації
  createDate: {type: Date, required: true, default: Date.now},

  source: String,
  photoSource: String,

  viewsCount: {type: Number, required: true, default: 0},
  likesCount: {
    facebook: {type: Number, required: true, default: 0},
    vk: {type: Number, required: true, default: 0},
    twitter: {type: Number, required: true, default: 0}
  },
  isAllowComments: Boolean,
  commentsCount: {type: Number, required: true, default: 0},

  isTop: Boolean,
  isHighlight: Boolean,

  ownPhoto: Boolean,

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

  removed: {type: Date},
  tags: [{title: String}],
  site: {
    _id: mongoose.Schema.Types.ObjectId,
    domain: String
  }
}, {
  strict: true,
  safe: true,
  collection: 'news'
});

schema.index({createDate: 1});

schema.plugin(autoIncrement.mongoosePlugin, {field: 'id'});
schema.index({id: 1}, {unique: true});

module.exports = mongoose.model('NewsItem', schema);
