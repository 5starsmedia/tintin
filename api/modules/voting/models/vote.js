'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  ip: String,
  choise: {
    _id: mongoose.Schema.Types.ObjectId
  },
  userAgent: {
    browser: String,
    version: String,
    os: String,
    platform: String
  },
  bulletin: String,
  createDate: {type: Date, required: true, default: Date.now}
});

schema.index({createDate: 1});

module.exports = schema;