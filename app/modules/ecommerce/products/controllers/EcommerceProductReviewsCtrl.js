export default
class EcommerceProductReviewsCtrl {
  /*@ngInject*/
  constructor($scope, EcommerceReviewModel, ngTableParams) {

    $scope.$watch('item.id', function (id) {
      if (angular.isUndefined(id)) {
        return;
      }

      $scope.loading = true;
      $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10           // count per page
      }, {
        getData: function ($defer, params) {

          var param = params.url();
          param.product_id = id;

          $scope.loading = true;
          EcommerceReviewModel.get(param, function (res) {
            var data = [];
            angular.forEach(res.data, function (item) {
              data.push(new EcommerceReviewModel(item));
            });
            $scope.loading = false;
            // set total for current product for indicate in tab
            $scope.item.$reviews_count = res.pager.total;

            params.total(res.pager.total);
            $defer.resolve(data);
          }, function () {
            $scope.loading = false;
          });

        }
      });

    });

  }

}