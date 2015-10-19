export default
class KeywordsMasterCtrl {
  /*@ngInject*/
  constructor($scope, basePermissionsSet) {

    $scope.hasPermission = basePermissionsSet.hasPermission;

  }
}