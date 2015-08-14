export default
class EcommerceCurrenciesCtrl {
  /*@ngInject*/
  constructor($scope, EcommerceCurrencyModel, ngTableParams, BaseAPIParams) {

    $scope.loading = true;

    $scope.tableParams = new ngTableParams({
      page: 1,            // show first page
      count: 10,          // count per page
      sorting: {
        'createDate': 'desc'
      }
    }, {
      getData: function ($defer, params) {

        $scope.loading = true;
        EcommerceCurrencyModel.query(BaseAPIParams({}, params), function (res, headers) {
          $scope.loading = false;
          params.total(headers('x-total-count'));
          $defer.resolve(res);
        }, function () {
          $scope.loading = false;
        });

      }
    });

    $scope.remove = function (item) {
      $scope.loading = true;
      item.$remove(function () {
        $scope.tableParams.reload();
      });
      return false;
    };
  }
}