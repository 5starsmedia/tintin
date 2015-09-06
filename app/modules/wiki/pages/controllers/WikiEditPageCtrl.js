export default
class WikiEditPageCtrl {

  /*@ngInject*/
  constructor($scope, $state, page, notify, $filter) {

    $scope.page = page;

    $scope.saveItem = (item) => {
      $scope.loading = true;
      let save = item._id ? item.$save : item.$create;
      save.call(item, (data) => {
        $scope.loading = false;
        notify({
          message: $filter('translate')('Wiki page saved!'),
          classes: 'alert-success'
        });
        $state.go('^.pages', { alias: data.alias });
      }, (res) => {
        $scope.loading = false;
        $scope.error = res.data;
      });
    }

  }
}