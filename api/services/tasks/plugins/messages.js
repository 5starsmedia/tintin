'use strict';

var async = require('async');

exports['db.newMessages.delete'] = exports['db.newMessages.insert'] = function (app, msg, next) {
  async.auto({
    newMessage: function (next) {
      app.models.newMessages.findById(msg.body._id, next);
    },
    dialog: ['newMessage', function (next, data) {
      app.models.dialogs.findById(data.newMessage.dialog._id, next);
    }],
    message: ['newMessage', function (next, data) {
      app.models.messages.findById(data.newMessage.message._id, next);
    }],
    stats: ['dialog', 'message', function (next, data) {
      async.map(data.dialog.accounts, function (acc, next) {
        app.models.newMessages.findOne({
          'account._id': acc._id,
          'message._id': data.message._id,
          removed: {$exists: false}
        }, function (err, newMsg) {
          if (err) { return next(err); }
          if (newMsg) {
            next(null, {account: {_id: acc._id}, newMessage: {_id: newMsg._id}, isNewMessage: true});
          } else {
            next(null, {account: {_id: acc._id}, isNewMessage: false});
          }
        });
      }, next);
    }],
    updateDialog: ['message', 'stats', function (next, data) {
      app.models.messages.update({_id: data.message._id}, {
        $set: {
          accountStats: data.stats,
          modifyDate: Date.now()
        }
      }, next);
    }]
  }, next);
};

