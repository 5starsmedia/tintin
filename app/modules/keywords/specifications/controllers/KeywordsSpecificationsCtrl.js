export default
class KeywordsSpecificationsCtrl {
  /*@ngInject*/
  constructor($scope, $state, KeywordsGroupModel, BaseAPIParams, NgTableParams, $modal) {
    $scope.tableParams = new NgTableParams({
      page: 1,
      count: 10,
      sorting: {
        createDate: 'desc'
      }
    }, {
      getData: function ($defer, params) {
        $scope.loading = true;
        KeywordsGroupModel.query(BaseAPIParams({ fields: 'title,createDate', status: 'inwork' }, params), function (projects, headers) {
          $scope.loading = false;
          $scope.projects = projects;
          $defer.resolve(projects);
          params.total(headers('x-total-count'));
        });
      }
    });
  }
}