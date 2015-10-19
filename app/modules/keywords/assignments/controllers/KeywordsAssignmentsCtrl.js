export default
class KeywordsAssignmentsCtrl {
  /*@ngInject*/
  constructor($scope, $state, KeywordsGroupModel, BaseAPIParams, NgTableParams, $auth, $modal) {
    var payload = $auth.getPayload();

    $scope.tableParams = new NgTableParams({
      page: 1,
      count: 10,
      sorting: {
        'result.dueDate': 'asc'
      }
    }, {
      getData: function ($defer, params) {
        $scope.loading = true;
        KeywordsGroupModel.query(BaseAPIParams({
          'result.account._id': payload._id,
          status: 'completed'
        }, params), function (projects, headers) {
          $scope.loading = false;
          $scope.projects = projects;
          $defer.resolve(projects);
          params.total(headers('x-total-count'));
        });
      }
    });
  }
}