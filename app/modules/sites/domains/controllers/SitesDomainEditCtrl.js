export default
class SitesDomainEditCtrl {

  /*@ngInject*/
  constructor($scope, $state, $filter, $stateParams, site, notify) {

    $scope.site = site;

    $scope.saveItem = (item) => {
      $scope.loading = true;
      let save = item._id ? item.$save : item.$create;
      save.call(item, (data) => {
        $scope.loading = false;
        notify({
          message: $filter('translate')('Domain saved!'),
          classes: 'alert-success'
        });
        $state.go('^.edit', { id: data._id });
      }, (res) => {
        $scope.loading = false;
        $scope.error = res.data;
      });
    }
  }
}