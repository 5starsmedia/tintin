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
        KeywordsPublicationModel.query(BaseAPIParams({
          'account._id': payload._id
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