export default
class KeywordsGroupsCtrl {
  /*@ngInject*/
  constructor($scope, $state, project, KeywordsGroupModel, BaseAPIParams, NgTableParams) {
    $scope.project = project;

    $scope.tableParams = new NgTableParams({
      page: 1,
      count: 100,
      sorting: {
        createDate: 'desc'
      }
    }, {
      getData: function ($defer, params) {
        $scope.loading = true;
        KeywordsGroupModel.query(BaseAPIParams({
          'project._id': project._id,
          status: [
            'new',
            'inprocess',
            'scaned',
            'finded',
            'completed',
            'returned'
          ]
        }, params), function (groups, headers) {
          $scope.loading = false;
          $scope.groups = groups;
          $defer.resolve(groups);
          params.total(headers('x-total-count'));
        });
      }
    });

    $scope.remove = function(item) {
      $scope.loading = true;
      item.$delete(function() {
        $scope.loading = false;

        $scope.tableParams.reload();
      })
    };
  }
}