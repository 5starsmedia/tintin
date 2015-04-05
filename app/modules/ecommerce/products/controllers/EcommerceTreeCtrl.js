export default
class EcommerceTreeCtrl {
  /*@ngInject*/
  constructor($scope, $stateParams, EcommerceCategoryModel) {

    $scope.loading = true;
    // get categories
    EcommerceCategoryModel.getTree(function (res) {
      $scope.loading = false;

      var parents = [];
      $scope.tree = res;

      // select active category
      $scope.activeCategory = EcommerceCategoryModel.find(res, function (item) {

        return item.id == $stateParams.category_id;

      }, parents);

      // open all nodes to active category
      if ($scope.activeCategory) {
        angular.forEach(parents, function (node) {
          node.$expanded = true;
        });
      }
    });
  }

}