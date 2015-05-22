export default
class UsersRolesListCtrl {
  /*@ngInject*/
  constructor($scope, UserRoleModel, ngTableParams, BaseAPIParams) {

    $scope.loading = true;

    $scope.tableParams = new ngTableParams({
      page: 1,            // show first page
      count: 10,          // count per page
      sorting: {
        'createDate': 'desc'
      }
    }, {
      getData: function ($defer, params) {

        $scope.loading = true;
        UserRoleModel.query(BaseAPIParams({}, params), function (res, headers) {
          $scope.loading = false;
          params.total(headers('x-total-count'));
          $defer.resolve(res);
        }, function () {
          $scope.loading = false;
        });

      }
    });

    $scope.updateItem = function (item) {
      item.$loading = true;
      var updateItem = new UserRoleModel({
        _id: item._id,
        activated: item.activated
      });
      updateItem.$save(function () {
        item.$loading = false;
      });
    };

    $scope.remove = function (item) {
      $scope.loading = true;
      item.$remove(function () {
        $scope.tableParams.reload();
      });
      return false;
    };
  }
}