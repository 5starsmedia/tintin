'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  fields: mongoose.Schema.Types.Mixed,

  createDate: {type: Date, required: true, default: Date.now},
  removed: {type: Date},
  site: {
    _id: mongoose.Schema.Types.ObjectId,
    domain: String
  }
}, {
  strict: true,
  safe: true,
  collection: 'feedbacks'
});

module.exports = mongoose.model('Feedback', schema);
