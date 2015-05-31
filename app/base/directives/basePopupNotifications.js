export default
  /*@ngInject*/
  function basePopupNotifications($log, $rootScope, $location, $auth, ioService, BaseNotificationModel, notificationService, favicoService, $state) {
    return {
      replace: true,
      restrict: 'A',
      scope: true,
      templateUrl: 'views/modules/base/directive-basePopupNotifications.html',
      link: function (scope, element, attrs) {
        $rootScope.listNotificationsCount = 0;

        scope.reload = () => {
          notificationService.getPopupNotifications().then(function (notifications) {
            scope.notifications = notifications;
          });
        };

        scope.$on('authLoginSuccess', () => {
          scope.reload();
        });
        scope.$on('authLogoutSuccess', () => {
          scope.notifications = [];
        });


        scope.close = (notification) => {
          notificationService.markAsRead(notification);
        };

        scope.go = (notification) => {
          scope.close(notification);

          //console.info(notification);
          $state.go('news.edit', { id: notification.resourceId })
        };
        scope.closeAll = () => {
          notificationService.markAllPopupAsRead();
        };

        ioService.on('notifications.changed', () => {
          $log.debug('[basePopupNotifications]', 'Socket event notifications.changed fired');

          scope.$apply(() => scope.reload());
        });

        ioService.on('notifications.countChanged', (data) => {
          $log.debug('[basePopupNotifications]', 'Notifications count changed', $rootScope.listNotificationsCount, '->', data.listNotificationsCount);

          if ($rootScope.listNotificationsCount < data.listNotificationsCount) {
            var snd = new Audio("assets/sounds/notification.mp3");
            snd.play();
          }
          $rootScope.$apply(() => {
            $rootScope.listNotificationsCount = data.listNotificationsCount;
            favicoService.badge($rootScope.listNotificationsCount);
          });
        });
        scope.reload();

      }
    }
  }