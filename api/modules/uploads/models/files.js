'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  title: {type: String, required: true},
  clientId: {type: String},
  originalName: {type: String, required: true},
  createDate: {type: Date, required: true, default: Date.now},
  removed: {type: Date},
  published: {type: Date},
  isTemp: {type: Boolean, default: false},
  account: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },
  contentType: {type: String, required: true},
  size: {type: Number, required: true, default: 0},
  width: Number,
  height: Number,
  isImage: {type: Boolean, required: true, default: false},
  storage: String,
  storageId: String,
  uploadedChunks: Number,
  totalChunks: Number,
  collectionName: {type: String},
  resourceId: {type: mongoose.Schema.Types.ObjectId},
  refs: [
    {
      collectionName: {type: String},
      resourceId: {type: mongoose.Schema.Types.ObjectId},
      title: {type: String}
    }
  ],
  viewsCount: {type: Number, required: true, default: 0},
  likesCount: {type: Number, required: true, default: 0},
  commentsCount: {type: Number, required: true, default: 0},
  sharesCount: {type: Number, required: true, default: 0},
  lastComment: {
    _id: mongoose.Schema.Types.ObjectId,
    createDate: {type: Date},
    account: {
      _id: mongoose.Schema.Types.ObjectId,
      title: String
    },
    text: String
  }
}, {
  strict: true,
  safe: true,
  collection: 'files',
  versionKey: false
});

schema.index({'collectionName': 1, 'resourceId': 1});
schema.index({'refs.collectionName': 1, 'refs.resourceId': 1});

module.exports = mongoose.model('Files', schema);
