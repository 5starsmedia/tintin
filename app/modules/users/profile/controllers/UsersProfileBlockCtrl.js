export default
class UsersProfileBlockCtrl {
  /*@ngInject*/
  constructor($scope, UsersProfileSrv) {
    UsersProfileSrv.getAccountInfo(function(info){
      $scope._account = info;
    });
  }
}