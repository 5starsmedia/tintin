export default
class UsersProfileCtrl {

  /*@ngInject*/
  constructor($scope, UsersProfileSrv) {
    UsersProfileSrv.getAccountInfo(function(info){
      $scope.account = info;
    });
  }
}