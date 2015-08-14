export default
class UsersProfileCtrl {

  /*@ngInject*/
  constructor($scope, user, notify, $filter, UserAccountModel) {
    $scope.account = angular.copy(user);

    $scope.$watch('account.coverFile._id', (id) => {
      var coverFile = user.coverFile || {};
      if (id == coverFile._id) {
        return;
      }

      user.coverFile = $scope.account.coverFile;
      UserAccountModel.save({ _id: user._id }, { coverFile: $scope.account.coverFile }, () => {
        notify({
          message: $filter('translate')('Avatar updated!'),
          classes: 'alert-success'
        });
      });
    });
  }
}