'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  title: String,

  fields: [{
    title: String
  }],

  createDate: {type: Date, required: true, default: Date.now},
  removed: {type: Date},
  site: {
    _id: mongoose.Schema.Types.ObjectId,
    domain: String
  }
}, {
  strict: true,
  safe: true,
  collection: 'contacts'
});

module.exports = mongoose.model('Contact', schema);
