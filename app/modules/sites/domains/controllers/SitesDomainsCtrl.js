export default
class SitesDomainsCtrl {
  /*@ngInject*/
  constructor($scope, $window, SiteDomainModel, BaseAPIParams, NgTableParams) {
    $scope.tableParams = new NgTableParams({
      page: 1,
      count: 10,
      sorting: {
        createDate: 'desc'
      }
    }, {
      getData: function ($defer, params) {
        $scope.loading = true;
        SiteDomainModel.query(BaseAPIParams({}, params), function (domains, headers) {
          $scope.loading = false;
          $scope.domains = domains;
          $defer.resolve(domains);
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