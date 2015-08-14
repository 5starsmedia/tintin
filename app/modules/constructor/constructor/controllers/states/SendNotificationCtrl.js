export default
class SendNotificationCtrl {
  /*@ngInject*/
  constructor($scope, UserAccountModel) {

    $scope.loading = true;
    UserAccountModel.query({ page:1, perPage: 100 }, function (users) {
      $scope.loading = false;

      $scope.users = users;
    }, function () {
      $scope.loading = false;
    });

    $scope.$watch('item.settings.userId', (userId) => {
      var user = _.find($scope.users, { _id: userId });
      if (user && !$scope.item.comment) {
        $scope.item.comment = user.title;
      }
    });
  }
}