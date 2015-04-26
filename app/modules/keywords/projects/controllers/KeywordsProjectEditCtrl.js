export default
class KeywordsProjectEditCtrl {
  /*@ngInject*/
  constructor($scope, $state, $filter, $stateParams, project, notify, $http, $sce) {

    $scope.project = project;

    $scope.saveItem = (item) => {
      $scope.loading = true;
      let save = item._id ? item.$save : item.$create;
      //delete item.files;
      save.call(item, (data) => {
        $scope.loading = false;
        //$state.go('news.posts');
        notify({
          message: $filter('translate')('Project saved!'),
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