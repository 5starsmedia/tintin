export default
class UsersProfileInfoCtrl {

  /*@ngInject*/
  constructor($scope, user, notify, UserRoleModel) {
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


    UserRoleModel.query({ page: 1, perPage: 100 }, (data) => {
      $scope.roles = data;
    });

    $scope.compareRole = (obj1, obj2) => {
      return obj1._id === obj2._id;
    };
  }
}