export default
class EcommerceRelatedProductsCtrl {
  /*@ngInject*/
  constructor($scope, ngTableParams, EcommerceBrandModel, EcommerceProductModel) {

    $scope.addRelatedProduct = function (product) {
      $scope.loading = true;
      EcommerceProductModel.addRelatedProduct({'id': $scope.item.id}, {'id': product.id}, function () {
        $scope.loading = false;
        $scope.tableParams.reload();
        $scope.relatedParams.reload();
      });
    };
    $scope.removeRelatedProduct = function (product) {
      $scope.loading = true;
      EcommerceProductModel.removeRelatedProduct({'id': $scope.item.id, 'product_id': product.id}, function () {
        $scope.loading = false;
        $scope.tableParams.reload();
        $scope.relatedParams.reload();
      });
    };

    $scope.loading = true;
    $scope.$watch('item.id', function (id) {
      if (angular.isUndefined(id)) {
        return;
      }

      $scope.relatedParams = new ngTableParams({
        page: 1,            // show first page
        count: 10           // count per page
      }, {
        getData: function ($defer, params) {

          $scope.loading = true;
          var param = params.url();
          param.id = id;
          EcommerceProductModel.getRelatedProducts(param, function (res) {
            var data = [];
            angular.forEach(res.data, function (item) {
              data.push(new EcommerceProductModel(item));
            });
            $scope.loading = false;
            params.total(res.pager.total);
            $defer.resolve(data);
          }, function () {
            $scope.loading = false;
          });

        }
      });


      $scope.loading = true;
      $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10           // count per page
      }, {
        getData: function ($defer, params) {

          $scope.loading = true;
          var param = params.url();
          param.id = id;
          EcommerceProductModel.getNotRelatedProducts(param, function (res) {
            var data = [];
            angular.forEach(res.data, function (item) {
              data.push(new EcommerceProductModel(item));
            });
            $scope.loading = false;
            params.total(res.pager.total);
            $defer.resolve(data);
          }, function () {
            $scope.loading = false;
          });

        }
      });
    });

  }

}