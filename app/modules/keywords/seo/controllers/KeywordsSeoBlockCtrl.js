export default
class KeywordsBlockGroupsCtrl {
  /*@ngInject*/
  constructor($scope, KeywordsSeoTaskModel, notify, $filter, NgTableParams, BaseAPIParams) {

    $scope.updateSeoPositions = () => {
      KeywordsSeoTaskModel.runTasks({ collectionName: 'posts', resourceId: $scope.post._id }, () => {
        notify({
          message: $filter('translate')('Article is added to queue for scan'),
          classes: 'alert-success'
        });
        $scope.tableParams.reload();
      });
    };

    $scope.reloadLog = () => {
      $scope.tableParams.reload();
    };

    $scope.tableParams = new NgTableParams({
      page: 1,
      count: 10,
      sorting: {
        createDate: 'desc'
      }
    }, {
      getData: function($defer, params) {
        $scope.loading = true;
        KeywordsSeoTaskModel.query(BaseAPIParams({ 'url.collectionName': 'posts', 'url.resourceId': $scope.post._id }, params),
          (logs, headers) =>{
            $scope.loading = false;
            $scope.logs = logs;
            $defer.resolve(logs);
            params.total(headers('x-total-count'));
          });
      }
    });

  }
}