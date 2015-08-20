export default
class IssuesTypesEditCtrl {

  /*@ngInject*/
  constructor($scope, item, notify, $filter) {
    $scope.item = item;

    $scope.sortableConfig = {
      group: 'fields',
      handle: '.drag-handle',
      animation: 150,
      onSort: (event) => {
        _.forEach(event.models, (model, n) => {
          model.ordinal = n;
        });
      }
    };

    $scope.addStatus = (item) => {

      $scope.item.statuses = $scope.item.statuses || [];
      $scope.item.statuses.push({});

    };
    $scope.removeStatus = (item) => {

      $scope.item.statuses = _.without($scope.item.statuses, item);

    };

    $scope.saveItem = (item) => {
      let save = item._id ? item.$save : item.$create,
        product = angular.copy(item);

      $scope.loading = true;
      save.call(product, (data) => {
        $scope.loading = false;

        notify({
          message: $filter('translate')('Saved!'),
          classes: 'alert-success'
        });
      }, (res) => {
        $scope.loading = false;
        $scope.error = res.data;
      });

    };
  }
}