'use strict';

var async = require('async');

exports['get/notifications?account._id&isListVisible'] = exports['get/notifications?account._id&isPopupVisible&isRead'] =
  function (req, params, next) {
    var modifiers = [];
    if (!req.auth.isGuest && params['account._id'] && params['account._id'].toString() === req.auth.account._id.toString()) {
      modifiers.push('owner');
    }
    next(null, modifiers);
  };

exports['delete/notifications?_id'] = function (req, params, next) {
  async.auto({
    notification: function (next) {
      req.app.models.notifications.findById(params._id, next);
    },
    modifiers: ['notification', function (next, data) {
      var modifiers = [];
      if (!req.auth.isGuest && data.notification.account._id.toString() === req.auth.account._id.toString()) {
        modifiers.push('owner');
      }
      next(null, modifiers);
    }]
  }, function (err, data) {
    if (err) { return next(err); }
    next(null, data.modifiers);
  });
};
