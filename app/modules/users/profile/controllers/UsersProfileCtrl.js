export default
class UsersProfileCtrl {

  /*@ngInject*/
  constructor($scope, user, UsersProfileSrv) {
    $scope.account = user;
    /*
    UsersProfileSrv.getAccountInfo(function(info){
      $scope.account = info;
    });*/
  }
}