/**
 * Mongoose files chunks model
 * @module models.fileChunks
 * @copyright 2014 Cannasos.com. All rights reserved.
 */

'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  account: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },
  file: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },
  size: {type: Number, required: true, default: 0},
  chunkNumber: {type: Number, required: true},
  data: Buffer
}, {
  strict: true,
  safe: true,
  collection: 'fileChunks',
  versionKey: false
});

module.exports = mongoose.model('FileChunks', schema);
