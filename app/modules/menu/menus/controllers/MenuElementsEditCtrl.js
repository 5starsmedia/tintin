export default
class MenuElementsEditCtrl {
  /*@ngInject*/
  constructor($scope, menu, MenuElementModel) {

    $scope.menu = menu;

    $scope.loading = true;
    MenuElementModel.getTree({ _id: menu._id }, function (res) {
      $scope.loading = false;
      $scope.tree = res;
    });

    $scope.addItem = function (child) {
      $scope.loading = true;
      child.$insertItem(function (item) {
        $scope.loading = false;
      });
    };

    $scope.move = function (item, before, index) {
      $scope.loading = true;
      item.$moveItem(before, index, function () {
        $scope.loading = false;
      });
    };

    $scope.saveItem = function (item) {
      var itm = new MenuElementModel(item);
      item.$loading = true;
      delete itm.$loading;
      delete itm.children;
      delete itm.id;
      delete itm.depth;
      delete itm._w;
      delete itm.path;
      itm.$save(function () {
        item.$loading = false;
      });
    };


    $scope.$watch('menu.menuType', (val, oldVal) => {
      if (!val || !oldVal) {
        return;
      }
      $scope.menu.$save();
    });

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
  }
}