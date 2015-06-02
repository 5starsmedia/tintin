'use strict';

var _ = require('lodash'),
  async = require('async');

var notificationOpts = {
  'message': {isPopupVisible: true, isListVisible: false, isEmailVisible: true},
  'postsComment': {isPopupVisible: true, isListVisible: true, isEmailVisible: true},
  'adviceComment': {isPopupVisible: true, isListVisible: true, isEmailVisible: true},
  'commentReply': {isPopupVisible: true, isListVisible: true, isEmailVisible: true},
  'strainReviewComment': {isPopupVisible: true, isListVisible: true, isEmailVisible: true},
  'follow': {isPopupVisible: true, isListVisible: true, isEmailVisible: true},
  'friend': {isPopupVisible: true, isListVisible: true, isEmailVisible: true},
  'friendRequest': {isPopupVisible: true, isListVisible: true, isEmailVisible: true},
  'shareComment': {isPopupVisible: true, isListVisible: true, isEmailVisible: true},
  'groupInvite': {isPopupVisible: true, isListVisible: true, isEmailVisible: true},
  'groupInviteAccept': {isPopupVisible: true, isListVisible: true, isEmailVisible: true},
  'groupRequestAcceptUser': {isPopupVisible: true, isListVisible: true, isEmailVisible: true},
  'groupRequestAcceptAdmin': {isPopupVisible: true, isListVisible: true, isEmailVisible: false},
  'groupRequestAdmin': {isPopupVisible: true, isListVisible: true, isEmailVisible: false}
};

function NotificationSvc(app) {
  this.app = app;
}

NotificationSvc.prototype._errorHandler = function (err) {
  var self = this;
  if (err) { self.app.log.error(err); }
};

NotificationSvc.prototype.send = function (accountId, notificationType, options, next) {
  var self = this;
  next = (typeof next !== 'function') ? _.bind(self._errorHandler, self) : next;
  async.auto({
    account: function (next) {
      self.app.models.accounts.findById(accountId, '_id title notifications email', next);
    },
    settings: ['account', function (next, data) {
      next(null, data.account.notifications[notificationType]);
    }],
    opts: ['account', 'settings', function (next, data) {
      var o = notificationOpts[notificationType];
      if (!o) { return next(new self.app.errors.OperationError('Invalid notification type ' + notificationType)); }
      var opts = _.pick(o, ['isPopupVisible', 'isListVisible', 'isEmailVisible']);
      if (data.settings) {
        if (!_.isUndefined(data.settings.list)) { opts.isListVisible = data.settings.list; }
        if (!_.isUndefined(data.settings.popup)) { opts.isPopupVisible = data.settings.popup; }
        if (!_.isUndefined(data.settings.email)) { opts.isEmailVisible = data.settings.email; }
      }
      next(null, opts);
    }],
    sameNotifications: ['account', 'opts', function (next, data) {
      var query = {
        'account._id': data.account._id,
        collectionName: options.collectionName,
        resourceId: options.resourceId,
        notificationType: notificationType,
        isRead: false,
        removed: {$exists: false}
      };
      self.app.models.notifications.update(query, {$set: {isRead: true}}, {multi: true}, next);
    }],
    createNotification: ['account', 'opts', 'sameNotifications', function (next, data) {
      var notification = _.extend({
        notificationType: notificationType,
        account: data.account.toObject(),
        collectionName: options.collectionName,
        resourceId: options.resourceId,
        urlParams: options.urlParams || null,
        resourceInfo: options.resourceInfo,
        title: options.title,
        text: options.text
      }, data.opts);
      self.app.models.notifications.create(notification, next);
    }]
  }, function (err, data) {
    if (err) { return next(err); }
    self.app.services.socket.sendToAccount(data.account._id, 'notifications.changed', {});
    self.app.services.tasks.publish('notifications.accountCounters', {account: {_id: data.account._id}});
    next();
  });
};

module.exports = NotificationSvc;
