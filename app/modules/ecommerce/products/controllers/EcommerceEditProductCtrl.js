export default
class EcommerceEditProductCtrl {
  /*@ngInject*/
  constructor($scope, product, $sce, EcommerceBrandModel, $filter, EcommerceCategoryModel, $state, $q, notify, $modal, variation) {

    if (variation) {
      angular.copy(variation, product);
      delete product._id;
      delete product.id;
      delete product.createDate;
      product.code += '-v' + ((product.productVariations.length || 0) + 1);
      product.variationProduct = variation;
    }
    $scope.item = product;

    $scope.loading_brands = true;
    EcommerceBrandModel.query({page: 1, perPage: 1000}, function (data) {
      $scope.loading_brands = false;

      $scope.brands = data;
    });

    EcommerceCategoryModel.getTree({page: 1, perPage: 1000}, function (data) {
      $scope.categories = data;
    });

    $scope.saveItem = function (item) {
      $scope.loading = true;

      var defers = [];

      delete item.viewsCount;
      let save = item._id ? item.$save : item.$create,
        product = angular.copy(item);

      if (variation && !item._id) {
        delete item.variationProduct;
      }

      save.call(item, (data) => {
        $scope.$broadcast('saveItem', item, defers);


        if (variation) {
          product._id = data._id;
          product.variationProduct = variation;
          defers.push(product.$save());
        }

        $q.all(defers).then(function () {
          $scope.loading = false;

          notify({
            message: $filter('translate')('Saved!'),
            classes: 'alert-success'
          });
          $state.go('^.edit', { id: data._id });
        });
      }, (res) => {
        $scope.loading = false;
        $scope.error = res.data;
      });
    };

    $scope.createVariationFromProduct = function () {
      var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'views/modules/ecommerce/modal-variation.html',
        controller: 'EcommerceVariationProductCtrl',
        resolve: {
          product: () => angular.copy(product)
        }
      });

      modalInstance.result.then(function (product) {
        $state.reload();
      });
    };

    $scope.createProductFromVariation = function (product) {
      $scope.loading = true;

      product.variationProduct = null;
      product.$deleteVariation(() => {
        $scope.loading = false;
        $state.reload();
      });
    };
  }

}