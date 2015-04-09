export default
class EcommerceEditProductCtrl {
  /*@ngInject*/
  constructor($scope, product, $sce, EcommerceBrandModel, $filter, EcommerceCategoryModel, $state, $q, notify) {


    $scope.item = product;

    $scope.loading_brands = true;
    EcommerceBrandModel.query({page: 1, perPage: 1000}, function (data) {
      $scope.loading_brands = false;

      $scope.brands = data;
    });

    var walk = function (item, ident) {
      angular.forEach(item.children, function (el) {
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
      //walk(data, 0);
      $scope.categories = data;
    });

    $scope.saveItem = function (item) {
      $scope.loading = true;

      var defers = [];

      delete item.viewsCount;
      let save = item._id ? item.$save : item.$create;
      //delete item.files;
      save.call(item, (data) => {
        $scope.$broadcast('saveItem', item, defers);

        $q.all(defers).then(function () {
          $scope.loading = false;

          notify('Сохранено', 'success');
          $state.go('ecommerce.products');
        });
      }, (res) => {
        $scope.loading = false;
        $scope.error = res.data;
      });
    }
  }

}