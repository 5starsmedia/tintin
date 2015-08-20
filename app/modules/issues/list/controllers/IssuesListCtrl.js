export default
class IssuesListCtrl {
  /*@ngInject*/
  constructor($scope, IssuesIssueModel, BaseAPIParams, NgTableParams) {

    $scope.tableParams = new NgTableParams({
      page: 1,
      count: 10,
      sorting: {
        createDate: 'desc'
      }
    }, {
      getData: function ($defer, params) {
        $scope.loading = true;
        IssuesIssueModel.query(BaseAPIParams({}, params), function (list, headers) {
          $scope.loading = false;
          $defer.resolve(list);
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