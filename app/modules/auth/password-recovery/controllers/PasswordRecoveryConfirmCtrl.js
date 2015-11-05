export default
class PasswordRecoveryConfirmCtrl {
  /*@ngInject*/
  constructor($scope, $auth, $state, $stateParams, AuthUserModel, basePermissionsSet, $timeout) {
    if (!$stateParams.token) {
      $state.go('^.password-recovery');
      return;
    }
    $scope.user = {
      token: $stateParams.token
    };

    $scope.resetPassword = (data) => {
      $scope.loading = true;

      AuthUserModel.checkResetToken(data, (res) => {
        $scope.loading = false;
        $scope.complete = true;

        basePermissionsSet.clearCache();
        $auth.setToken(res.token);
        $timeout(() => {
          $state.go('cabinet.dashboard');
        }, 3000)
      }, (res) => {
        $scope.loading = false;
        if (res.status == 422) {
          $scope.error = res.data;
        }
      });
    }
  }
}