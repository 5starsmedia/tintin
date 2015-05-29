'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  createDate: {type: Date, required: true, default: Date.now},
  removed: {type: Date},
  account: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    imageUrl: String,
    coverFile: {
      _id: mongoose.Schema.Types.ObjectId,
      title: String
    },
    email: String
  },
  realAccount: {
    _id: mongoose.Schema.Types.ObjectId
  },
  isPublished: {type: Boolean, required: true, default: true},

  isSpam: {type: Boolean, required: true, default: false},
  isAnonymous: {type: Boolean, required: true, default: false},
  collectionName: {type: String, required: true},
  resourceId: {type: mongoose.Schema.Types.ObjectId, required: true},
  text: String,
  likesCount: {type: Number, required: true, default: 0},
  contributionPoints: {type: Number, required: true, default: 0},
  isContributionEnabled: {type: Boolean, required: true, default: true},
  indent: {type: Number, required: true, default: 0},
  cid: {type: String, required: true},
  parentComment: {
    _id: mongoose.Schema.Types.ObjectId,
    isAnonymous: {type: Boolean, required: true, default: false},
    account: {
      _id: mongoose.Schema.Types.ObjectId,
      title: String
    }
  },
  socialName: {type: String, enum: ['facebook']},
  socialId: String
}, {
  strict: true,
  safe: false,
  collection: 'comments',
  versionKey: false
});

module.exports = mongoose.model('Comments', schema);
