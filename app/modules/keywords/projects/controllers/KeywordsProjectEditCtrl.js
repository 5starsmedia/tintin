export default
class KeywordsProjectEditCtrl {
  /*@ngInject*/
  constructor($scope, $state, $filter, project, notify) {

    $scope.project = project;
    $scope.item = project;

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
        $state.go('^.projectView', { id: data._id });
        $scope.$close(data);
      }, (res) => {
        $scope.loading = false;
        $scope.error = res.data;
      });
    };


    $scope.close = () => {
      $scope.$dismiss('cancel');
    };
  }
}