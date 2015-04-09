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
      app.models.accounts.findById(data.notification.resourceInfo.account._id, next);
    }]
  }, function (err, data) {
    if (err) { return next(err); }
    model.account = data.account;
    model.senderAccount = data.senderAccount;
    model.notification = data.notification;
    model.relations = data.relations;

    sendOpts.subject = data.senderAccount.title + ' have sent you a message';
    next(null, model);
  });
};
