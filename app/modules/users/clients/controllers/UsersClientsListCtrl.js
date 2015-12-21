export default
class UsersClientsListCtrl {
  /*@ngInject*/
  constructor($scope, $http, UserAccountModel, ngTableParams, BaseAPIParams) {

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
        $http.get('http://season-de-luxe.5stars.link/dashboard-api/clients').then(res => {
          $scope.loading = false;
          $defer.resolve(res.data);
        })

      }
    });

    $scope.updateItem = function (item) {
      item.$loading = true;
      var updateItem = new UserAccountModel({
        _id: item._id,
        username: item.username,
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