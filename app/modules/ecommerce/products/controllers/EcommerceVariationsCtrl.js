export default
class EcommerceVariationsCtrl {
  /*@ngInject*/
  constructor($scope, EcommerceProductModel, ngTableParams) {

    $scope.tableParams = new ngTableParams({
      page: 1,            // show first page
      count: 10,          // count per page
      sorting: {
        'createDate': 'desc'
      }
    }, {
      getData: function ($defer, params) {
        let data = $scope.item.productVariations || [];

        params.total(data.length);
        $defer.resolve(data);
      }
    });


    $scope.updateItem = function (item) {
      item.$loading = true;
      var updateItem = new EcommerceProductModel({
        _id: item._id,
        ordinal: item.ordinal,
        isPublished: !!item.isPublished,
        price: item.price
      });
      updateItem.$save(function () {
        item.$loading = false;
      });
    };

    $scope.remove = function (item) {
      $scope.loading = true;
      item.$remove(function () {
        $scope.tableParams.reload();
      });
      return false;
    };
  }

}