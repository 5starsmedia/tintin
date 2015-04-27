export default
class EcommerceCurrencyEditCtrl {
  /*@ngInject*/
  constructor($scope, currency, $state, notify) {
    $scope.item = currency;

    $scope.saveItem = function(item) {
      $scope.loading = true;

      let save = item._id ? item.$save : item.$create;
      //delete item.files;
      save.call(item, (data) => {
        $scope.loading = false;

        notify('Сохранено', 'success');
        $state.go('ecommerce.currencies');
      });
    };

  }
}