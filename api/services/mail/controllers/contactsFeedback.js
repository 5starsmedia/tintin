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
    feedback: ['notification', function (next, data) {
      app.models.feedbacks.findById(data.notification.resourceId, next);
    }]
  }, function (err, data) {
    if (err) { return next(err); }
    model.account = data.account;
    model.notification = data.notification;
    model.feedback = data.feedback;

    sendOpts.subject = 'New feedback';
    next(null, model);
  });
};
