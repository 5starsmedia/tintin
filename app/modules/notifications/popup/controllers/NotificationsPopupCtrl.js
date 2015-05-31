export default
class NotificationsPopupCtrl {
  /*@ngInject*/
  constructor($scope, notificationService, ioService, $log, favicoService) {
    $scope.loading = true;
    notificationService.getPopupNotifications().then((data) => {
      $scope.loading = false;
      $scope.messages = data;
    });
  }
}