export default
class EcommerceVariationProduct {
  /*@ngInject*/
  constructor($scope, product, $modalInstance, $http, $sce, EcommerceProductModel) {

    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.product = product;

    $scope.products = [];
    $scope.loadProducts = function (x) {
      EcommerceProductModel.search({ page:1, perPage: 10, fields: 'title,coverFile,code', sort: '-createDate', isVariation: false, search: x }, function(data) {
        $scope.products = _.filter(data, (item) => {
          return product._id != item._id;
        });
      });
    };
    $scope.selectSource = (item, model) => {
      $scope.product.variationProduct = item;
    };

    $scope.trustAsHtml = function(value) {
      return $sce.trustAsHtml(value);
    };

    $scope.saveItem = function(value) {
      $scope.loading = true;
      delete product.isVariation;
      product.$save(() => {
        $scope.loading = false;
        $modalInstance.close(product);
      });
    };
  }

}