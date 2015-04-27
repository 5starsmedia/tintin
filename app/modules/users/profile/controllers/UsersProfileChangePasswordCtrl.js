export default
class UsersProfileChangePasswordCtrl {

  /*@ngInject*/
  constructor($scope, user, UsersProfileSrv) {
    $scope.account = user;
    /*
    UsersProfileSrv.getAccountInfo(function(info){
      $scope.account = info;
    });*/
  }
}