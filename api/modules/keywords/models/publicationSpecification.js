'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  title: {type: String, required: true},
  category: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },

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

  createDate: {type: Date, required: true, default: Date.now},
  removed: {type: Date}
}, {
  strict: true,
  safe: true,
  collection: 'publicationSpecifications'
});

module.exports = mongoose.model('PublicationSpecification', schema);
