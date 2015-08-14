'use strict';

var async = require('async');

function notifyPostComment(app, comment, next) {
  app.models.posts.findById(comment.resourceId, 'account', function (err, post) {
    if (err) { return next(err); }
    if (!comment.isAnonymous && comment.account._id.toString() === post.account._id.toString()) { return next(); }
    var opts = {
      collectionName: 'posts',
      resourceId: post._id,
      title: 'New comment',
      text: comment.text,
      resourceInfo: {
        account: comment.toObject().account
      }
    };
    if (post.account && post.account._id) {
      app.services.notification.send(post.account._id, 'postsComment', opts, next);
    } else {
      next();
    }
  });
}

exports['db.comments.insert'] = function (app, msg, next) {
  app.models.comments.findById(msg.body._id, function (err, comment) {
    if (err) { return next(err); }
    if (comment.collectionName === 'posts') {
      notifyPostComment(app, comment, next);
    } else {
      next();
    }
  });
};

exports['db.notifications.update'] = exports['db.notifications.delete'] = function (app, msg, next) {
  async.auto({
    notification: function (next) {
      app.models.notifications.findById(msg.body._id, next);
    },
    updateListNotificationsCount: ['notification', function (next, data) {
      if (!data.notification.isListVisible) { return next(); }
      var query = {
        'account._id': data.notification.account._id,
        isRead: false,
        isListVisible: true,
        removed: {$exists: false}
      };
      app.models.notifications.count(query, function (err, count) {
        if (err) { return next(err); }
        app.models.accounts.update({_id: data.notification.account._id}, {
          $set: {
            listNotificationsCount: count
          },
          $inc: {
            listNotificationsVersion: 1
          }
        }, next);
      });
    }],
    updatePopupNotificationsCount: ['notification', function (next, data) {
      if (!data.notification.isPopupVisible) { return next(); }
      var query = {'account._id': data.notification.account._id, isPopupVisible: true, removed: {$exists: false}};
      app.models.notifications.count(query, function (err, count) {
        if (err) { return next(err); }
        app.models.accounts.update({_id: data.notification.account._id}, {
          $set: {
            popupNotificationsCount: count
          },
          $inc: {
            popupNotificationsVersion: 1
          }
        }, next);
      });
    }]
  }, next);
};

exports['notifications.mailing'] = function (app, msg, next) {
  var date = new Date((new Date()).getTime() - app.config.get('notifications.mailingDelay'));
  async.times(5, function (n, next) {
    app.models.notifications.findOneAndUpdate(
      {isMailed: false, isEmailVisible: true, removed: {$exists: false}, isRead: false, createDate: {$lt: date}},
      {isMailed: true, mailedDate: Date.now()},
      {sort: {_id: 1}, multi: true}, function (err, notification) {
        if (err) { return next(err); }
        if (!notification || !notification.account) { return next(); }
        app.models.accounts.findById(notification.account._id, function (err, account) {
          if (err) { return next(err); }
          if (!account) { return next(); }
          if (!account.activated) {
            app.log.info('[notifications.mailing]', 'Cannot send notification email to unactivated account', account.username);
            return next();
          }
          if (!account.email || account.email.length === 0) {
            app.log.warn('[notifications.mailing]', 'Cannot send notification email to', account.username);
            return next();
          }
          app.log.debug('[notifications.mailing]', 'mailing notification ', notification.notificationType);
          app.services.mail.sendTemplate(notification.notificationType, account.email, {_id: notification._id}, next);
        });
      });
  }, next);
};

exports['notifications.accountCounters'] = function (app, msg, next) {
  var accountId = msg.body.account._id;
  async.auto({
    updateListNotificationsCount: [function (next) {
      var listCountQuery = {
        'account._id': accountId,
        isRead: false,
        isListVisible: true,
        removed: {$exists: false}
      };
      app.models.notifications.count(listCountQuery, function (err, count) {
        if (err) { return next(err); }
        app.models.accounts.update({_id: accountId}, {
          $set: {listNotificationsCount: count},
          $inc: {listNotificationsVersion: 1}
        }, function (err) {
          if (err) { return next(err); }
          next(null, count);
        });
      });
    }],
    updatePopupNotificationsCount: [function (next) {
      var popupCountQuery = {
        'account._id': accountId,
        isRead: false,
        isPopupVisible: true,
        removed: {$exists: false}
      };
      app.models.notifications.count(popupCountQuery, function (err, count) {
        if (err) { return next(err); }
        app.models.accounts.update({_id: accountId}, {
          $set: {popupNotificationsCount: count},
          $inc: {popupNotificationsVersion: 1}
        }, function (err) {
          if (err) { return next(err); }
          next(null, count);
        });
      });
    }],
    notify: ['updateListNotificationsCount', 'updatePopupNotificationsCount', function (next, data) {
      app.services.socket.sendToAccount(accountId, 'notifications.countChanged', {
        listNotificationsCount: data.updateListNotificationsCount,
        popupNotificationsCount: data.updatePopupNotificationsCount
      });
      next();
    }]
  }, next);
};
