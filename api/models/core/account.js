/**
 * Copyright 2015 5starsmedia.com.ua
 *
 * lib/server/models/core/account.js
 * Account mongoose model
 */
'use strict';

var mongoose = require('mongoose');

var accountSchema = new mongoose.Schema({
  accountType: {type: String, default: 'system', enum: ['system', 'facebook', 'twitter', 'google']},
  username: {type: String, required: true},
  email: {type: String},
  title: {type: String, required: true},
  createDate: {type: Date, required: true, default: Date.now},
  modifyDate: {type: Date},
  randomField: {type: Number, required: true, default: Math.random},
  removed: {type: Date},
  activityDate: {type: Date},
  loginDate: {type: Date},
  extUser: String,
  extToken: String,
  extTokenSecret: String,
  imageUrl: String,
  pwd: {type: String},
  salt: {type: String},
  activated: {type: Boolean, required: true, default: false},
  activationDate: Date,
  activationToken: {type: String},
  passwordResetToken: {type: String},
  passwordResetDate: {type: Date},
  totalContributionPoints: {type: Number, required: true, default: 0},
  commentsCount: {type: Number, required: true, default: 0},
  likesCount: {type: Number, required: true, default: 0},
  viewsCount: {type: Number, required: true, default: 0},
  messagesCount: {type: Number, required: true, default: 0},
  newMessagesCount: {type: Number, required: true, default: 0},
  followersCount: {type: Number, required: true, default: 0},
  followingCount: {type: Number, required: true, default: 0},
  friendsCount: {type: Number, required: true, default: 0},
  friendRequestsCount: {type: Number, required: true, default: 0},
  popupNotificationsCount: {type: Number, required: true, default: 0},
  popupNotificationsVersion: {type: Number, required: true, default: 0},
  listNotificationsCount: {type: Number, required: true, default: 0},
  listNotificationsVersion: {type: Number, required: true, default: 0},
  notifications: {
    receiveNews: {type: Boolean, default: true, required: true},
    receiveDigest: {type: Boolean, default: true, required: true},
    follow: {
      email: {type: Boolean, default: true, required: true},
      list: {type: Boolean, default: true, required: true},
      popup: {type: Boolean, default: true, required: true}
    },
    friend: {
      email: {type: Boolean, default: true, required: true},
      list: {type: Boolean, default: true, required: true},
      popup: {type: Boolean, default: true, required: true}
    },
    friendRequest: {
      email: {type: Boolean, default: true, required: true},
      list: {type: Boolean, default: true, required: true},
      popup: {type: Boolean, default: true, required: true}
    },
    blogComment: {
      email: {type: Boolean, default: true, required: true},
      list: {type: Boolean, default: true, required: true},
      popup: {type: Boolean, default: true, required: true}
    },
    adviceComment: {
      email: {type: Boolean, default: true, required: true},
      list: {type: Boolean, default: true, required: true},
      popup: {type: Boolean, default: true, required: true}
    },
    strainReviewComment: {
      email: {type: Boolean, default: true, required: true},
      list: {type: Boolean, default: true, required: true},
      popup: {type: Boolean, default: true, required: true}
    },
    message: {
      email: {type: Boolean, default: true, required: true},
      list: {type: Boolean, default: true, required: true},
      popup: {type: Boolean, default: true, required: true}
    },
    commentReply: {
      email: {type: Boolean, default: true, required: true},
      list: {type: Boolean, default: true, required: true},
      popup: {type: Boolean, default: true, required: true}
    }
  },
  profileStrength: {type: Number, required: true, default: 0},
  profile: {
    facebookUrl: {type: String},
    dateOfBirth: {type: Date},
    age: Number,
    gender: {
      _id: mongoose.Schema.Types.ObjectId,
      title: String
    },
    country: {
      _id: mongoose.Schema.Types.ObjectId,
      title: String,
      shortTitle: String
    },
    state: {
      _id: mongoose.Schema.Types.ObjectId,
      title: String,
      shortTitle: String
    },
    city: String,
    zodiac: {
      _id: mongoose.Schema.Types.ObjectId,
      title: String,
      cssClass: String
    },
    ageCategory: {
      _id: mongoose.Schema.Types.ObjectId,
      title: String,
      cssClass: String
    },
    address: {
      country: {type: String},
      street: {type: String}
    },
    phone: {type: String},
    firstName: {type: String},
    middleName: {type: String},
    lastName: {type: String},
    interests: {type: String},
    primaryLanguage: {
      _id: mongoose.Schema.Types.ObjectId,
      title: String,
      alias: String,
      code: String
    },
    secondaryLanguage: {
      _id: mongoose.Schema.Types.ObjectId,
      title: String,
      alias: String,
      code: String
    }
  },
  tokens: [
    {
      value: {type: String, required: true},
      createDate: {type: Date, required: true, default: Date.now},
      persist: {type: Boolean, required: true, default: false},
      expireAt: {type: Date, required: true},
      userAgent: {type: String, required: true, default: 'none'},
      userHost: {type: String, required: true, default: 'none'},
      userSystem: {type: String, required: true, default: 'none'}
    }
  ],
  roles: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      title: {type: String, required: true}
    }
  ],
  coverFile: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },
  files: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      title: String
    }
  ]
}, {
  strict: true,
  safe: true,
  collection: 'accounts'
});

accountSchema.index({username: 1}, {unique: true});
accountSchema.index({'tokens.value': 1});

module.exports = mongoose.model('Account', accountSchema);
