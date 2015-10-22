'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  title: {type: String, required: true},
  uid: String, // text uniq check
  category: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },
  group: {
    _id: mongoose.Schema.Types.ObjectId
  },
  account: {
    _id: mongoose.Schema.Types.ObjectId,
    username: String,
    title: String,
    imageUrl: String,
    coverFile: {
      _id: mongoose.Schema.Types.ObjectId,
      title: String
    }
  },
  postId: mongoose.Schema.Types.ObjectId,

  status: {type: String, default: 'new', enum: [
    'new',
    'inprocess',
    'completed',
    'incompleted'
  ]},
  validation: {
    editor: {
      comment: String,
      status: {type: String, default: 'none', enum: [
        'none',
        'pass',
        'invalid'
      ]},
    },
    expert: {
      comment: String,
      status: {type: String, default: 'none', enum: [
        'none',
        'pass',
        'invalid'
      ]},
    }
  },
  text: String, // готовая статья
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

  textLength: {
    min: Number,
    max: Number
  },
  keywords: [{
    required: Boolean,      // обов'язкове використання
    keyword: String,        // ключове слово
    useEntry: Number,       // кількість використань
    useType: {type: String} //, default: 'both', enum: ['both', 'exact', 'inexact']}
  }],

  urls: [{
    url: String
  }],

  dueDate: Date,
  createDate: {type: Date, required: true, default: Date.now},
  removed: {type: Date}
}, {
  strict: true,
  safe: true,
  collection: 'publicationSpecifications'
});

module.exports = mongoose.model('PublicationSpecification', schema);
