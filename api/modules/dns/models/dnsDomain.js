'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  name: {type: String, required: true},

  createDate: {type: Date, required: true, default: Date.now},
  modifyDate: {type: Date},

  removed: {type: Date}
}, {
  strict: true,
  safe: true,
  collection: 'dnsDomains'
});

schema.index({createDate: 1});

module.exports = mongoose.model('DnsDomain', schema);
