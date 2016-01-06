export default
class KeywordsAssignmentsCtrl {
  /*@ngInject*/
  constructor($scope, $state, KeywordsGroupModel, BaseAPIParams, NgTableParams, $auth, $modal, basePermissionsSet) {
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
        var param = {
          status: ['assigned','completed']
        };
        if (basePermissionsSet.hasPermission(['keywords.groups'])) {
          param['result.account._id'] = payload._id;
          $scope.isAdmin = true;
        }
        KeywordsGroupModel.query(BaseAPIParams(param, params), function (projects, headers) {
          $scope.loading = false;
          $scope.projects = projects;
          $defer.resolve(projects);
          params.total(headers('x-total-count'));
        });
      }
    });
  }
}