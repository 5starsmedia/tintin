'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  // Назва
  title: {type: String, required: true},
  keywords: {type: String, required: true},

  status: {type: String, default: 'new', enum: [
    'new',
    'inprocess',
    'scaned',
    'finded',
    'completed',
    'editorValidation',// видно у редактора
    'returned',// редактор вернул на доработку
    'inwork', // в роботі у автора
    'moderation',
    'failedModeration',
    'success'
  ]},

  category: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    alias: String
  },

  project: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },
  createDate: {type: Date, required: true, default: Date.now},

  result: {
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
    text: String, // готовая статья
    editorNotes: String, // комментарий редактора
    creatorNotes: String, // комментарий компоновщика
    authorNotes: String, // комментарий автора
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
    dueDate: Date,
    urls: [{
      url: String,
      count: Number,
      use: Boolean
    }],
    additionalsWords: [{
      _id: mongoose.Schema.Types.ObjectId,
      word: String,
      use: Boolean
    }]
  },
  recomendation: {
    minTextLength: Number,
    maxTextLength: Number,
    keywords: [{
      keyword: String,
      entry: Number,
      entryInTop3: Number,
      useEntry: Number,
      required: Boolean,
      useType: {type: String}//, default: 'both', enum: ['both', 'exact', 'inexact']}
    }]
  },
  scanResult: {
    lastDate: Date,
    keywords: [{
      title: String,
      yandexScanResult: String,
      sites: [{
        site: String,
        additionalsWords: [{ word: String, stem: String }],
        url: String
      }]
    }]
  },

  removed: {type: Date}
}, {
  strict: true,
  safe: true,
  collection: 'keywordGroups'
});

module.exports = mongoose.model('KeywordGroup', schema);
