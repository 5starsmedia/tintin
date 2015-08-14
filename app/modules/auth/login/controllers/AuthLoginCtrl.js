export default
class AuthLoginCtrl {

  /*@ngInject*/
  constructor($scope, $rootScope, $state, $auth, basePermissionsSet) {
    // загрузка данных, которые были сохранены при установле галочки "Запомнить меня"
    var localAuthData = angular.fromJson((localStorage || {}).authData || '{}');

    if ($auth.isAuthenticated() && $state.current.name == 'auth.login') {
      $state.go('cabinet.dashboard');
      return;
    }

    $scope.isLocked = !!localAuthData.email;
    $scope.user = {
      email: localAuthData.email || '',
      password: localAuthData.password || '',
      rememberMe: true
    };

    $scope.differentUser = function (provider) {
      (localStorage || {}).authData = '{}';
      $scope.isLocked = false;
      $scope.user = {
        email: '',
        password: '',
        rememberMe: true
      };
    };

    $scope.authenticate = function (provider) {
      $scope.loading = true;
      $auth.authenticate(provider).then(function () {
        basePermissionsSet.clearCache();
        $scope.loading = false;
        $rootScope.$broadcast('authLoginSuccess');
        $state.go('cabinet.dashboard');
      }).catch(function (res) {
        $scope.loading = false;
        if (res.status == 422) {
          $scope.error = res.data;
        }
      });
    };

    $scope.submitAuth = function (user) {
      $scope.error = null;

      // сохранение введеного логина и пароля в локалсторедж
      (localStorage || {}).authData = user.rememberMe ? angular.toJson(user) : '{}';

      $scope.loading = true;
      $auth.login(user).then(function (data) {
        $scope.loading = false;
        basePermissionsSet.clearCache();
        $rootScope.$broadcast('authLoginSuccess');
        $state.go('cabinet.dashboard');
      }).catch(function (res) {
        $scope.loading = false;
        if (res.status == 422) {
          $scope.error = res.data;
        }
      });
    }
  }
}