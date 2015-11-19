'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  title: String,
  body: String,

  location: {
    lat: Number,
    lng: Number
  },

  createDate: {type: Date, required: true, default: Date.now},
  removed: {type: Date},
  site: {
    _id: mongoose.Schema.Types.ObjectId,
    domain: String
  }
}, {
  strict: true,
  safe: true,
  collection: 'contactsGeo'
});

module.exports = mongoose.model('ContactGeo', schema);
