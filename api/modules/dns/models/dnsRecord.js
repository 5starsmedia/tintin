'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  domain: {
    _id: mongoose.Schema.Types.ObjectId,
    name: String
  },

  type: {type: String, required: true},
  content: {type: String, required: true},
  host: String,
  ttl: Number,
  priority: Number,

  createDate: {type: Date, required: true, default: Date.now},
  modifyDate: {type: Date},

  removed: {type: Date}
}, {
  strict: true,
  safe: true,
  collection: 'dnsRecords'
});

schema.index({createDate: 1});

module.exports = mongoose.model('DnsRecord', schema);
