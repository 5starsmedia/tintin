'use strict';

var mongoose = require('mongoose'),
  autoIncrement = require("../../../models/plugin/autoincrement.js"),
  createdBy = require("../../../models/plugin/createdBy.js");

var schema = new mongoose.Schema({
  title: String,
  body: String,

  issuePrefix: String,
  issueType: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },

  account: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    coverFile: {
      _id: mongoose.Schema.Types.ObjectId,
      title: String
    }
  },
  assignAccount: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    coverFile: {
      _id: mongoose.Schema.Types.ObjectId,
      title: String
    }
  },
  status: {
    title: String,
    statusType: String
  },
  files: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      title: String,
      ordinal: Number
    }
  ],
  attachments: [
    {
      resourceId: mongoose.Schema.Types.ObjectId,
      collectionName: String,
      title: String
    }
  ],


  createDate: {type: Date, required: true, default: Date.now},
  removed: {type: Date}
}, {
  strict: true,
  safe: true,
  collection: 'issues'
});

schema.plugin(autoIncrement.mongoosePlugin, {field: 'issueNumber'});
schema.plugin(createdBy);

module.exports = mongoose.model('Issue', schema);
