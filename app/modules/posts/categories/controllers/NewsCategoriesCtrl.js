export default
class NewsCategoriesCtrl {
  /*@ngInject*/
  constructor($scope, $state, $filter, $stateParams, NewsCategoryModel, postType) {

    $scope.postType = postType;

    $scope.loading = true;
    $scope.editedItem = { _id: null };

    var loadData = () => {
      NewsCategoryModel.getTree({ postType: postType }, function (res) {
        $scope.loading = false;
        $scope.tree = res;
      });
    };
    loadData();

    $scope.$on('UpdateTree', loadData);

    $scope.addItem = function (child) {
      $scope.loading = true;
      child.$insertItem(function (item) {
        $scope.loading = false;
        item.focus = true;
        item.$settings = true;
      });
    };

    $scope.move = function (item, before, index) {
      $scope.loading = true;
      item.$moveItem(before, index, function () {
        $scope.loading = false;
      });
    };

    $scope.remove = function (child) {
      function walk(target) {
        var children = target.children,
          i;
        if (children) {
          i = children.length;
          while (i--) {
            if (children[i]._id == child._id) {
              return children.splice(i, 1);
            } else {
              walk(children[i]);
            }
          }
        }
      }

      $scope.loading = true;
      child.$delete(function () {
        $scope.loading = false;
        walk($scope.tree);
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      });
    };

    $scope.setActive = function(item) {
      $scope.selectedItem = item;
      $state.go(postType + '.categories.edit', { id: item._id });
    }
  }
}