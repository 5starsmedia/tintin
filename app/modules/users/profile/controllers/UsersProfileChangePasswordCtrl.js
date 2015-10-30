export default
class UsersProfileChangePasswordCtrl {

  /*@ngInject*/
  constructor($scope, user, UsersProfileSrv, notify) {
    $scope.user = user;
    /*
    UsersProfileSrv.getAccountInfo(function(info){
      $scope.account = info;
    });*/

    $scope.saveItem = function(item) {
      $scope.loading = true;

      item.$save((data) => {
        $scope.loading = false;

        notify({
          message: 'Пароль изменен',
          classes: 'alert-success'
        });
      });
    };
  }
}