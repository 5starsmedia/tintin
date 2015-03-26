export default
class EcommerceList {
  /*@ngInject*/
  constructor($scope, EcommerceProductModel, ngTableParams, BaseAPIParams) {

    $scope.loading = true;

    $scope.tableParams = new ngTableParams({
      page: 1,            // show first page
      count: 10           // count per page
    }, {
      getData: function ($defer, params) {

        $scope.loading = true;
        EcommerceProductModel.query(BaseAPIParams({}, params), function (res, headers) {
          var data = [];
          angular.forEach(res.data, function (item) {
            data.push(new EcommerceProductModel(item));
          });
          $scope.loading = false;
          params.total(headers('x-total-count'));
          $defer.resolve(data);
        }, function () {
          $scope.loading = false;
        });

      }
    });

    $scope.updatePrice = function (item) {
      item.$loading = true;
      item.$updatePrice(function () {
        item.$loading = false;
      });
    };

    $scope.updateOrder = function (item) {
      item.$loading = true;
      item.$updateOrder(function () {
        item.$loading = false;
      });
    };

    $scope.filterByCategory = function (category) {
      $scope.tableParams.filter({category_id: category.id});
    };

    $scope.changePublish = function (item) {
      item.publish = !item.publish;
      $scope.loading = true;
      item.$save(function () {
        $scope.loading = false;
      })
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