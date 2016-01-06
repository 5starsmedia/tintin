export default
class KeywordsSpecificationsCtrl {
  /*@ngInject*/
  constructor($scope, $state, KeywordsGroupModel, BaseAPIParams, NgTableParams, $auth, KeywordsPublicationModel) {
    var payload = $auth.getPayload();

    $scope.tableParams = new NgTableParams({
      page: 1,
      count: 10,
      sorting: {
        dueDate: 'asc'
      }
    }, {
      getData: function ($defer, params) {
        $scope.loading = true;

        var param = {
          'account._id': payload._id
        };
        if (basePermissionsSet.hasPermission(['keywords.groups'])) {
          delete param['account._id'];
          $scope.isAdmin = true;
        }
        KeywordsPublicationModel.query(BaseAPIParams(param, params), function (projects, headers) {
          $scope.loading = false;
          $scope.projects = projects;
          $defer.resolve(projects);
          params.total(headers('x-total-count'));
        });
      }
    });
  }
}