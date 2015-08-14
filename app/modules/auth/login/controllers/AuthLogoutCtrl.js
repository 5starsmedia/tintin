export default
class AuthLogoutCtrl {

  /*@ngInject*/
  constructor($rootScope, $auth, $location, basePermissionsSet) {
    if (!$auth.isAuthenticated()) {
      $location.path('/');
      return;
    }
    basePermissionsSet.clearCache();
    $rootScope.$broadcast('authLogoutSuccess');
    $auth.logout();
  }

}