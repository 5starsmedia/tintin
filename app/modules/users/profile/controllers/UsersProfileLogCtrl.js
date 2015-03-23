export default
class UsersProfileLogCtrl {

  /*@ngInject*/
  constructor($scope, UsersProfileSrv, UserLogRecordModel, BaseAPIParams, NgTableParams) {
    var _id = UsersProfileSrv.getAccountId();

    $scope.tableParams = new NgTableParams({
      page: 1,
      count: 10,
      sorting: {
        createDate: 'desc'
      }
    }, {
      getData: function($defer, params) {
        $scope.loading = true;
        UserLogRecordModel.query(BaseAPIParams({'account._id': _id}, params), function(logs, headers){
          $scope.loading = false;
          $scope.logs = logs;
          $defer.resolve(logs);
          params.total(headers('x-total-count'));
        });
      }
    });

  }
}