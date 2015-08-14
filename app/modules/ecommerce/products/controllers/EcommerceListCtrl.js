export default
class EcommerceList {
  /*@ngInject*/
  constructor($scope, EcommerceProductModel, ngTableParams, BaseAPIParams) {

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
        EcommerceProductModel.query(BaseAPIParams({ isVariation: false }, params), function (res, headers) {
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
      var updateItem = new EcommerceProductModel({
        _id: item._id,
        ordinal: item.ordinal,
        isPublished: !!item.isPublished,
        price: item.price
      });
      updateItem.$save(function () {
        item.$loading = false;
      });
    };

    $scope.filterByCategory = function (category) {
      $scope.tableParams.filter({'category._id': category._id});
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