'use strict';

var express = require('express'),
  router = express.Router(),
  async = require('async');

router.post('/mark-as-read/:_id', function (req, res, next) {
  async.auto({
    markAsRead: function (next) {
      req.app.models.notifications.update({_id: req.params._id}, {$set: {isRead: true}}, next);
    }
  }, function (err) {
    if (err) { return next(err); }
    req.app.services.tasks.publish('notifications.accountCounters', {account: {_id: req.auth.account._id}});
    req.app.services.socket.sendToAccount(req.auth.account._id, 'notifications.changed', {});
    res.status(204).end();
  });
});

router.post('/mark-as-read', function (req, res, next) {
  async.auto({
    markAsRead: function (next) {
      var query = {
        'account._id': req.auth.account._id,
        isRead: false,
        removed: {$exists: false}
      };
      if (req.query.isPopupVisible) {
        query.isPopupVisible = true;
      }
      if (req.query.isListVisible) {
        query.isListVisible = true;
      }
      req.app.models.notifications.update(query, {$set: {isRead: true}}, {multi: true}, next);
    }
  }, function (err) {
    if (err) { return next(err); }
    req.app.services.tasks.publish('notifications.accountCounters', {account: {_id: req.auth.account._id}});
    req.app.services.socket.sendToAccount(req.auth.account._id, 'notifications.changed', {});
    res.status(204).end();
  });
});

module.exports = router;
