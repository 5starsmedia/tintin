export default
class EcommerceRelatedProductsCtrl {
  /*@ngInject*/
  constructor($scope, ngTableParams, EcommerceBrandModel, EcommerceProductModel, BaseAPIParams) {

    $scope.addRelatedProduct = function (product) {
      $scope.item.relatedProducts.push({
        _id: product._id,
        title: product.title
      });
      $scope.tableParams.reload();
    };
    $scope.removeRelatedProduct = function (product) {
      var index = _.indexOf($scope.item.relatedProducts, { _id: product._id });
      $scope.item.relatedProducts.splice(index, 1);
      $scope.tableParams.reload();
    };

    $scope.loading = true;
    $scope.$watch('item._id', function (id) {
      if (angular.isUndefined(id)) {
        return;
      }
      $scope.item.relatedProducts = $scope.item.relatedProducts || [];

      $scope.loading = true;
      $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10           // count per page
      }, {
        counts: [],
        getData: function ($defer, params) {

          var relatedIds = _.pluck($scope.item.relatedProducts, '_id');
          relatedIds.push(id);

          $scope.loading = true;
          EcommerceProductModel.query(BaseAPIParams({ isVariation: false }, params), function (data, headers) {
            $scope.loading = false;

            data = _.filter(data, (item) => {
              return _.indexOf(relatedIds, item._id) == -1;
            });

            params.total(parseInt(headers('x-total-count')));
            $defer.resolve(data);
          }, function () {
            $scope.loading = false;
          });

        }
      });
    });

  }

}