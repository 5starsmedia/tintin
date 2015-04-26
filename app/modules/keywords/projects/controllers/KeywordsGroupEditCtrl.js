export default
class KeywordsGroupEditCtrl {
  /*@ngInject*/
  constructor($scope, $state, project, group, notify, $filter) {
    $scope.project = project;
    $scope.group = group;


    $scope.saveItem = (item) => {
      $scope.loading = true;
      let save = item._id ? item.$save : item.$create;
      save.call(item, (data) => {
        $scope.loading = false;
        notify({
          message: $filter('translate')('Group saved!'),
          classes: 'alert-success'
        });
        $state.go('^.groupEdit', { id: data._id, projectId: project._id });
      }, (res) => {
        $scope.loading = false;
        $scope.error = res.data;
      });
    }
  }
}