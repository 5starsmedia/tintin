/**
 * Log record model
 *
 * Copyright 2015 5starsmedia.com.ua
 */
'use strict';

var mongoose = require('mongoose');

var logRecordSchema = new mongoose.Schema({
  createDate: {type: Date, required: true, default: Date.now},
  msg: {type: String, required: true},
  name: {type: String, required: true},
  pid: {type: Number, required: true, default: 0},
  level: {type: Number, required: true, default: 0},
  hostname: {type: String, required: true, default: 'undefined'},
  account: {
    _id: mongoose.Schema.Types.ObjectId,
    username: String
  },
  req: {
    method: String,
    id: String,
    url: String,
    remoteAddress: String,
    remotePort: Number,
    userAgent: {
      browser: String,
      version: String,
      platform: String,
      os: String
    }
  },
  refs: [
    {
      'collectionName': String,
      resourceId: mongoose.Schema.Types.ObjectId,
      title: String
    }
  ]
}, {
  strict: true,
  safe: true,
  collection: 'logRecords',
  versionKey: false
});

logRecordSchema.index({'refs._id': 1, 'refs.collectionName': 1});


module.exports = mongoose.model('LogRecord', logRecordSchema);
