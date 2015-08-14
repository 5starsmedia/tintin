export default
class UsersRolesEditCtrl {
  /*@ngInject*/
  constructor($scope, role, $filter, $state, notify, UserPermissionModel) {

    $scope.item = role;

    $scope.saveItem = (item) => {
      $scope.loading = true;
      let save = item._id ? item.$save : item.$create;
      //delete item.files;
      save.call(item, (data) => {
        $scope.loading = false;
        notify({
          message: $filter('translate')('Role saved!'),
          classes: 'alert-success'
        });
        $state.go('^.edit', { _id: data._id });
      }, (res) => {
        $scope.loading = false;
        $scope.error = res.data;
      });
    };

    UserPermissionModel.query({ page: 1, perPage: 100 }, (data) => {
      $scope.permissions = data;
    });

    $scope.comparePermission = (obj1, obj2) => {
      return obj1.name === obj2.name;
    };
  }
}