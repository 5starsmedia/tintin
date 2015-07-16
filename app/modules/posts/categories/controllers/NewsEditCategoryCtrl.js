export default
class NewsEditCategoryCtrl {
  /*@ngInject*/
  constructor($scope, item, $state, NewsCategoryModel, $modal, notify, $filter, postType) {
    $scope.item = item;
    $scope.postType = postType;

    $scope.$watch('tree', function(tree) {
      if (angular.isUndefined(tree)) {
        return;
      }
      var parents = [], editedItem = NewsCategoryModel.find(tree, function (item) {
        return item._id == $scope.item._id;
      }, parents);
      $scope.editedItem._id = editedItem._id;
      parents.shift();
      _.forEach(parents, function (node) {
        node.$expanded = true;
      });
    });

    $scope.remove = function (field) {
      $scope.loading = true;
      field.$delete(function () {
        $scope.loading = false;
      })
    };

    $scope.saveItem = function (item) {
      var category = angular.copy(item);
      $scope.loading = true;
      delete category.children;
      delete category.$settings;
      delete category.$loading;
      delete category.id;
      delete category.focus;
      delete category.depth;
      delete category.path;
      delete category.__v;
      delete category._w;
      $scope.error = null;
      category.$save((data) => {
        $scope.loading = false;
        item.url = data.url;

        notify({
          message: $filter('translate')('Item saved!'),
          classes: 'alert-success'
        });
        $scope.$emit('UpdateTree');
      }, (res) => {
        $scope.loading = false;
        $scope.error = res.data;
      });
    };

    $scope.cancel = function () {
      $scope.editedItem._id = null;
      $state.go(postType + '.categories');
    };
  }
}