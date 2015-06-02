'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  createDate: {type: Date, required: true, default: Date.now},
  modifyDate: {type: Date},
  removed: {type: Date},
  account: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },
  title: {type: String, required: true},
  text: {type: String, required: true},
  isMailed: {type: Boolean, required: true, default: false},
  mailedDate: Date,
  isRead: {type: Boolean, required: true, default: false},
  isPopupVisible: {type: Boolean, required: true, default: false},
  isListVisible: {type: Boolean, required: true, default: false},
  isEmailVisible: {type: Boolean, required: true, default: false},
  notificationType: {
    type: String,
    required: true,
    default: 'message',
    enum: ['message', 'postComment', 'postsComment', 'commentReply', 'system', 'shareComment', 'share']
  },
  collectionName: {type: String, required: true},
  resourceId: {type: mongoose.Schema.Types.ObjectId, required: true},
  resourceInfo: mongoose.Schema.Types.Mixed
}, {
  strict: true,
  collection: 'notifications',
  versionKey: false
});

schema.index({'account._id': 1, removed: 1});

module.exports = mongoose.model('Notification', schema);
