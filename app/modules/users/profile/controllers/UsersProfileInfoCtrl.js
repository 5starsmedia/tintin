export default
class UsersProfileInfoCtrl {

  /*@ngInject*/
  constructor($scope, user, notify) {
    $scope.user = user;

    $scope.saveItem = function(item) {
      $scope.loading = true;

      item.$save((data) => {
        $scope.loading = false;

        notify('Сохранено', 'success');
      });
    };

    $scope.$watch('user.profile.lastName + " " + user.profile.firstName', (title) => {
      $scope.user.title = title;
    });
  }
}