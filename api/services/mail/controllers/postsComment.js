'use strict';

var async = require('async');

exports.controller = function (app, sendOpts, model, next) {
  async.auto({
    notification: function (next) {
      app.models.notifications.findById(model._id, next);
    },
    account: ['notification', function (next, data) {
      app.models.accounts.findById(data.notification.account._id, next);
    }],
    senderAccount: ['notification', function (next, data) {
      if (!data.notification.resourceInfo || !data.notification.resourceInfo.account || !data.notification.resourceInfo.account._id) {
        return next();
      }
      app.models.accounts.findById(data.notification.resourceInfo.account._id, next);
    }],
    post: ['notification', function (next, data) {
      app.models.posts.findById(data.notification.resourceId, next);
    }]
  }, function (err, data) {
    if (err) { return next(err); }
    model.account = data.account;
    model.senderAccount = data.senderAccount;
    model.notification = data.notification;
    model.post = data.post;
    model.url = app.services.url.urlFor('posts', data.post);

    sendOpts.subject = 'New comment on your post "' + data.post.title + '"';
    next(null, model);
  });
};
