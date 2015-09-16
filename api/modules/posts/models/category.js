'use strict';

var mongoose = require('mongoose'),
  materializedPlugin = require('mongoose-materialized');

var schema = new mongoose.Schema({
  id: Number,

  postType: {type: String, default: 'news', enum: ['news', 'post', 'page', 'announce']},

  // Назва
  title: {type: String, required: true},
  alias: String,
  parentAlias: String,
  description: String,

  isPublished: Boolean,

  cssClass: String,
  postsCount: {type: Number, required: true, default: 0},

  createDate: {type: Date, required: true, default: Date.now},

  meta: {
    title: String,
    keywords: String,
    description: String
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
  site: {
    _id: mongoose.Schema.Types.ObjectId,
    domain: String
  }
}, {
  strict: true,
  safe: true,
  collection: 'categories'
});

schema.plugin(materializedPlugin);

module.exports = mongoose.model('Category', schema);
