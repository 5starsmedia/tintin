'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  title: {type: String, required: true},
  ip: {type: String, required: true},

  description: String,

  auth: {
    login: String,
    password: String
  },

  createDate: {type: Date, required: true, default: Date.now},
  modifyDate: {type: Date},

  removed: {type: Date}
}, {
  strict: true,
  safe: true,
  collection: 'nodeServers'
});

schema.index({createDate: 1});

module.exports = mongoose.model('NodeServer', schema);
