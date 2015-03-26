export default
class EcommerceEditAttributesCtrl {
  /*@ngInject*/
  constructor($scope, $sce, $filter, EcommerceProductFieldModel, EcommerceTypeModel, $rootScope) {

    $scope.$watch('item.type_id', function (id) {
      if (angular.isUndefined(id)) {
        return;
      }

      $scope.loading = true;
      EcommerceProductFieldModel.query({product_id: $scope.item.id, type_id: id}, function (data) {
        $scope.loading = false;

        $scope.fields = data;
      });
    });

    var walk = function (item, ident) {
      angular.forEach(item.items, function (el) {
        el.$ident = ident;
        el.$title = $sce.trustAsHtml(
          Array(el.$ident).join('&nbsp;&nbsp;&nbsp;&nbsp;') +
          $filter('language')(el.title)
        );
        types.push(el);

        walk(el, ident + 1);
      });
    }, types = [];
    EcommerceTypeModel.get({}, function (data) {
      walk(data, 0);
      $scope.types = types;
    });

    $scope.$on('saveItem', function (e, item, defers) {
      $scope.loading = true;
      var def = EcommerceProductFieldModel.saveFields({
        product_id: item.id,
        type_id: item.type_id
      }, {fields: $scope.fields || []}, function (data) {
        $scope.loading = false;

        $scope.fields = data;
      });
      defers.push(def.$promise);
    });
  }

}