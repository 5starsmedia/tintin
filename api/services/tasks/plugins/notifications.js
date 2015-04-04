'use strict';

var async = require('async');

function notifyStrainReviewComment(app, comment, next) {
  app.models.strainReviews.findById(comment.resourceId, 'account', function (err, strainReview) {
    if (err) { return next(err); }
    if (!comment.isAnonymous && comment.account._id.toString() === strainReview.account._id.toString()) { return next(); }
    var opts = {
      collectionName: 'strainReviews',
      resourceId: strainReview._id,
      title: 'New strain review comment',
      text: app.services.text.trimText(comment.text, 50),
      resourceInfo: {
        account: comment.toObject().account
      }
    };
    app.services.notification.send(strainReview.account._id, 'strainReviewComment', opts, next);
  });
}

function notifyBlogComment(app, comment, next) {
  app.models.blogs.findById(comment.resourceId, 'account', function (err, blog) {
    if (err) { return next(err); }
    if (!comment.isAnonymous && comment.account._id.toString() === blog.account._id.toString()) { return next(); }
    var opts = {
      collectionName: 'blogs',
      resourceId: blog._id,
      title: 'New blog comment',
      text: app.services.text.trimText(comment.text, 50),
      resourceInfo: {
        account: comment.toObject().account
      }
    };
    app.services.notification.send(blog.account._id, 'blogComment', opts, next);
  });
}

function notifyAdviceComment(app, comment, next) {
  app.models.advices.findById(comment.resourceId, 'account', function (err, advice) {
    if (err) { return next(err); }
    if (!comment.isAnonymous && comment.account._id.toString() === advice.account._id.toString()) { return next(); }
    var opts = {
      collectionName: 'advices',
      resourceId: advice._id,
      title: 'New advice reply',
      text: app.services.text.trimText(comment.text, 50),
      resourceInfo: {
        account: comment.toObject().account
      }
    };
    app.services.notification.send(advice.account._id, 'adviceComment', opts, next);
  });
}

function notifyShareComment(app, comment, next) {
  app.models.shares.findById(comment.resourceId, 'account._id', function (err, share) {
    if (err) { return next(err); }
    if (!comment.isAnonymous && comment.account._id.toString() === share.account._id.toString()) { return next(); }
    var opts = {
      collectionName: 'shares',
      resourceId: share._id,
      title: 'New share comment',
      text: app.services.text.trimText(comment.text, 50),
      resourceInfo: {
        account: comment.toObject().account
      }
    };
    app.services.notification.send(share.account._id, 'shareComment', opts, next);
  });
}

exports['db.comments.insert'] = function (app, msg, next) {
  app.models.comments.findById(msg.body._id, function (err, comment) {
    if (err) { return next(err); }
    if (comment.collectionName === 'advices') {
      notifyAdviceComment(app, comment, next);
    } else if (comment.collectionName === 'blogs') {
      notifyBlogComment(app, comment, next);
    } else if (comment.collectionName === 'strainReviews') {
      notifyStrainReviewComment(app, comment, next);
    } else if (comment.collectionName === 'shares') {
      notifyShareComment(app, comment, next);
    } else {
      next();
    }
  });
};

exports['db.messages.insert'] = function (app, msg, next) {
  async.auto({
    message: function (next) {
      app.models.messages.findById(msg.body._id, next);
    },
    dialog: ['message', function (next, data) {
      app.models.dialogs.findById(data.message.dialog._id, next);
    }],
    notify: ['dialog', 'message', function (next, data) {
      var opts = {
        collectionName: 'dialogs',
        resourceId: data.dialog._id,
        resourceInfo: {
          account: data.message.toObject().account
        },
        title: 'New message',
        text: app.services.text.trimText(data.message.text, 50)
      };
      async.each(data.dialog.accounts, function (acc, next) {
        if (acc._id.toString() === data.message.account._id.toString()) { return next(); }
        app.services.notification.send(acc._id, 'message', opts, next);
      }, next);
    }]
  }, next);
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
          if (!account.email || account.email.length === 0) {
            app.log.warn('[notifications.mailing]', 'Cannot send notification email to', account.title);
            return next();
          }
          app.log.debug('[notifications.mailing]', 'mailing notification ', notification.notificationType);
          app.services.mail.sendTemplate(notification.notificationType, account.email, {_id: notification._id}, next);
        });
      });
  }, next);
};

exports['notifications.insert'] = function (app, msg, next) {
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
          if (!account.email || account.email.length === 0) {
            app.log.warn('[notifications.mailing]', 'Cannot send notification email to', account.title);
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
        }, function(err){
          if (err) { return next(err); }
          next(null, count)
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
        }, function(err){
          if (err) { return next(err); }
          next(null, count)
        });
      });
    }],
    notify: ['updateListNotificationsCount', 'updatePopupNotificationsCount', function (next, data) {
      app.services.socket.sendToAccount(accountId, 'notifications.countChanged', {
        listNotificationsCount:data.updateListNotificationsCount,
        popupNotificationsCount:data.updatePopupNotificationsCount
      });
      next();
    }]
  }, next);
};
