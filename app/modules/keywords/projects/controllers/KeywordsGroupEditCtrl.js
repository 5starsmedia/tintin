export default
class KeywordsGroupEditCtrl {
  /*@ngInject*/
  constructor($scope, $state, project, group, notify, $filter, KeywordsUrlPreview) {
    $scope.project = project;
    $scope.group = group;

    $scope.keywords = group.keywords.split("\n");

    $scope.runScan = () => {
      $scope.loadingScan = true;
      group.$runScan(() => {
        $scope.loadingScan = false;
      });
    };

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
    };

    $scope.activeUrl = null;
    $scope.previewUrl = (url) => {
      $scope.activeUrl = url;
      $scope.loadingPreview = true;
      KeywordsUrlPreview.getPreview({ url: url }, (data) => {
        $scope.loadingPreview = false;
        $scope.parsedData = data;
      });
    }
  }
}