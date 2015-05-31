/**
 *
 */

function /*@ngInject*/ NotificationSvc($log, $q, $http, $auth, baseEventService, BaseNotificationModel) {
  angular.extend(NotificationSvc.prototype, baseEventService.EventEmitterBase.prototype);
  baseEventService.EventEmitterBase.call(this, $log);
  this.notificationRes = BaseNotificationModel;
  this.$log = $log;
  this.$q = $q;
  this.$auth = $auth;
  this.$http = $http;
  this.popupNotifications = [];
  this.silenced = [];
}

NotificationSvc.prototype.addSilence = function (collectionName, resourceId) {
  this.$log.debug('[NotificationSvc]', 'Add silence', collectionName + '/' + resourceId);
  this.silenced.push({collectionName: collectionName, resourceId: resourceId});
  this.reloadPopup();
};

NotificationSvc.prototype.removeSilence = function (collectionName, resourceId) {
  this.$log.debug('[NotificationSvc]', 'Remove silence', collectionName + '/' + resourceId);
  _.remove(this.silenced, {collectionName: collectionName, resourceId: resourceId});
};

NotificationSvc.prototype.reloadPopup = function () {
  var self = this;
  var account = self.$auth.getPayload();
  if (!account) {
    var d = self.$q.defer();
    d.resolve([]);
    return d.promise;
  }
  return self.notificationRes.query({
    'account._id': account._id,
    isPopupVisible: true,
    isRead: false,
    page: 1,
    perPage: 3,
    sort: '-createDate'
  }).$promise.then(function (notifications) {
      var tasks = [];
      _.each(notifications, function (n) {
        var s = _.find(self.silenced, {collectionName: n.collectionName, resourceId: n.resourceId});
        if (s) {
          self.$log.debug('[NotificationSvc]', 'Notification', n._id, 'blocked, by silence', n.collectionName + '/' + n.resourceId);
          tasks.push(self.markAsRead(n, true));
        }
      });
      if (tasks.length > 0) {
        return self.$q.all(tasks).then(function () {
          return self.reloadPopup();
        });
      } else {
        self.popupNotifications = notifications;
        return self.popupNotifications;
      }
    });
};

NotificationSvc.prototype.getPopupNotifications = function () {
  return this.reloadPopup();
};

NotificationSvc.prototype.markAsRead = function (notification) {
  return this.notificationRes.markAsRead({ _id: notification._id }, {isPopupVisible: true}).$promise;
};

NotificationSvc.prototype.markAllPopupAsRead = function () {
  return this.notificationRes.markAsRead({}, {isPopupVisible: true}).$promise;
};

NotificationSvc.prototype.markAllListAsRead = function () {
  return this.notificationRes.markAsRead({}, {isListVisible: true}).$promise;
};

export default NotificationSvc;