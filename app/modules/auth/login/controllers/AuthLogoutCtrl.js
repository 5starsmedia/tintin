export default
class AuthLogoutCtrl {

  /*@ngInject*/
  constructor($scope, $auth, $location, basePermissionsSet) {
    if (!$auth.isAuthenticated()) {
      $location.path('/');
      return;
    }
    basePermissionsSet.clearCache();
    $auth.logout();
  }

}