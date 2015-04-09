export default
class MenuMenusCtrl {
  /*@ngInject*/
  constructor($scope, $window, MenuElementModel) {

    var loadInfo = () => {
      $scope.loading = true;
      MenuElementModel.query({ parentId: 'null', page: 1, perPage: 100 }, function (menus, headers) {
        $scope.loading = false;
        $scope.menus = menus;
        //params.total(headers('x-total-count'));
      });
    };
    loadInfo();

    $scope.remove = function(item) {
      $scope.loading = true;
      item.$delete(function() {
        $scope.loading = false;

        $scope.tableParams.reload();
      })
    };

    $scope.addItem = function() {
      var item = new MenuElementModel({
        title: 'New item'
      });
      $scope.loading = true;
      item.$newMenu(function() {
        loadInfo();
      })
    }
  }
}