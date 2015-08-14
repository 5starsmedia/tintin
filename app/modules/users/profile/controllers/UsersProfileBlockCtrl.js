export default
class UsersProfileBlockCtrl {
  /*@ngInject*/
  constructor($scope, $state, UsersProfileSrv, $auth, basePermissionsSet) {
    let payload = $auth.getPayload();

    UsersProfileSrv.getAccountInfo(function(info){
      $scope._account = info;

      $scope.currentRole = _.find($scope._account.roles, { _id: payload.role_id });
    });

    $scope.changeRole = (roleId) => {
      UsersProfileSrv.changeRole(roleId, function(roleId){
        $scope.currentRole = _.find($scope._account.roles, { _id: roleId });
        basePermissionsSet.clearCache();
        $state.reload();
      });
    };
  }
}