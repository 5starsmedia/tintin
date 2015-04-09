'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  // Назва
  title: {type: String, required: true},
  id: {type: Number, required: true},

  createDate: {type: Date, required: true, default: Date.now},
  freeDate: {type: Date},
  lastResultDate: {type: Date},

  response: String,

  isEnabled: {type: Boolean, required: true, default: true},
  isFree: Boolean,
  isSuccess: Boolean,
  isSMSSend: Boolean
}, {
  strict: true,
  safe: true,
  collection: 'visaDates'
});

schema.index({id: 1}, {unique: true});
schema.index({createDate: 1});

module.exports = mongoose.model('VisaDate', schema);