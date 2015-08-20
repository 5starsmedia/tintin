export default
class IssuesTypesListCtrl {
  /*@ngInject*/
  constructor($scope, IssuesTypeModel) {


    IssuesTypeModel.query({}, function (list, headers) {
      $scope.loading = false;
      $scope.types = list;
      //params.total(headers('x-total-count'));
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