'use strict';

var async = require('async');

exports['stat.dialogs.messagesCount'] = function (app, msg, next) {
  app.models.messages.count({'dialog._id': msg.body._id, removed: {$exists: false}}, function (err, messagesCount) {
    if (err) { return next(err); }
    app.models.dialogs.update({_id: msg.body._id}, {$set: {messagesCount: messagesCount}}, next);
  });
};

exports['db.newMessages.delete'] = exports['db.newMessages.insert'] = function (app, msg, next) {
  async.auto({
    newMessage: function (next) {
      app.models.newMessages.findById(msg.body._id, next);
    },
    dialog: ['newMessage', function (next, data) {
      app.models.dialogs.findById(data.newMessage.dialog._id, next);
    }],
    newMessagesCount: ['dialog', function (next, data) {
      async.map(data.dialog.accounts, function (acc, next) {
        app.models.newMessages.count({
          'account._id': acc._id,
          'dialog._id': data.dialog._id,
          removed: {$exists: false}
        }, function (err, c) {
          if (err) { return next(err); }
          next(null, {account: {_id: acc._id}, newMessagesCount: c});
        });
      }, next);
    }],
    updateDialog: ['dialog', 'newMessagesCount', function (next, data) {
      app.models.dialogs.update({_id: data.dialog._id}, {
        $set: {
          accountStats: data.newMessagesCount,
          modifyDate: Date.now()
        }
      }, next);
    }]
  }, next);
};

