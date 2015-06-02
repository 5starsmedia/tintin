'use strict';

var async = require('async'),
  moment = require('moment'),
  _ = require('lodash');

exports['send.notification'] = function (app, state, args, next) {
  async.auto({
    'comment': function (next) {
      app.models.comments.findById(args._id, next);
    },
    'account': function (next) {
      app.models.accounts.findById(state.settings.userId, next);
    },
    'sendNotification': ['account', 'comment', function (next, data) {
      // if comment from owner
      if (!data.comment.isAnonymous && data.comment.account._id.toString() === data.account._id.toString()) { return next(); }

      var opts = {
        collectionName: data.comment.collectionName,
        resourceId: data.comment.resourceId,
        title: 'New comment',
        text: data.comment.text,
        resourceInfo: {
          account: data.comment.toObject().account
        }
      };
      app.services.notification.send(data.account._id, data.comment.collectionName + 'Comment', opts, next);
    }]
  }, next);
};