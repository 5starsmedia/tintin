'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  title: {type: String, required: true},
  htmlCode: String,

  fixed: Boolean,
  places: [{
    id: String,
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
  collection: 'adsCodes',
  versionKey: false
});

schema.index({createDate: 1});

module.exports = mongoose.model('AdsCode', schema);
