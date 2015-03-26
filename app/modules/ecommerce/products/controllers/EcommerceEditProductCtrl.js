export default
class EcommerceEditProductCtrl {
  /*@ngInject*/
  constructor($scope, product, $sce, EcommerceBrandModel, $filter, EcommerceCategoryModel, $state, $q) {


    $scope.item = product;

    $scope.loading_brands = true;
    EcommerceBrandModel.query({page: 1, perPage: 1000}, function (data) {
      $scope.loading_brands = false;

      $scope.brands = data.data;
    });

    var walk = function (item, ident) {
      angular.forEach(item.items, function (el) {
        el.$ident = ident;
        el.$title = $sce.trustAsHtml(
          Array(el.$ident).join('&nbsp;&nbsp;&nbsp;&nbsp;') +
          $filter('language')(el.title)
        );
        categories.push(el);

        walk(el, ident + 1);
      });
    }, categories = [];
    EcommerceCategoryModel.query({page: 1, perPage: 1000}, function (data) {
      walk(data, 0);
      $scope.categories = categories;
    });

    $scope.saveItem = function (item) {
      $scope.loading = true;

      var defers = [];

      item.$save(function () {
        $scope.$broadcast('saveItem', item, defers);

        $q.all(defers).then(function () {
          $scope.loading = false;

          $scope.notify('Сохранено', 'success');
          $state.go('ecommerce.products');
        });
      });
    }
  }

}