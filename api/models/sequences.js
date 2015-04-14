'use strict';


var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  name: {type: String, required: true},
  value: {type: Number, required: true, default: 0},
  createDate: {type: Date, required: true, 'default': Date.now},
  modifyDate: {type: Date}
}, {
  versionKey: false,
  collection: 'sequences',
  strict: true,
  safe: true
});

schema.index({'name': true}, {unique: true});

module.exports = mongoose.model('Sequence', schema);
