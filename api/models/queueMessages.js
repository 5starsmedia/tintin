'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  queue: {type: String, required: true},
  createDate: {type: Date, required: true, default: Date.now},
  body: {type: mongoose.Schema.Types.Mixed},
  locked: { type: Boolean, required: true, default: false},
  lockDate: {type: Date},
  attemptsCount: {type: Number, required: true, default: 0}
}, {
  strict: true,
  safe: true,
  collection: 'queueMessages',
  versionKey: false
});

schema.index({queue: 1, _id: 1});

module.exports = mongoose.model('QueueMessages', schema);
