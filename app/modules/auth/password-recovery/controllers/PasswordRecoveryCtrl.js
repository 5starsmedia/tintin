export default
class PasswordRecoveryCtrl {
  /*@ngInject*/
  constructor($scope, AuthUserModel) {

    $scope.resetPassword = (data) => {
      $scope.loading = true;
      AuthUserModel.sendReset(data, (res) => {
        $scope.loading = false;
        $scope.complete = true;
      }, (res) => {
        $scope.loading = false;
        if (res.status == 422) {
          $scope.error = res.data;
        }
      });
    }
  }
}