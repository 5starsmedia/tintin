'use strict';

var mongoose = require('mongoose'),
  autoIncrement = require("../../../models/plugin/autoincrement.js"),
  createdBy = require("../../../models/plugin/createdBy.js");

var schema = new mongoose.Schema({
  urlFrom: String,
  urlTo: String,
  code: Number,

  createDate: {type: Date, required: true, default: Date.now},
  removed: {type: Date},
  site: {
    _id: mongoose.Schema.Types.ObjectId,
    domain: String
  }
}, {
  strict: true,
  safe: true,
  collection: 'redirects'
});

schema.index({createDate: 1});

module.exports = mongoose.model('Redirect', schema);
