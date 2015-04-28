export default
class UsersUserCreateCtrl {
  /*@ngInject*/
  constructor($scope, UserAccountModel, notify, $state) {
    $scope.item = new UserAccountModel();

    $scope.saveItem = function(item) {
      $scope.loading = true;

      let save = item._id ? item.$save : item.$create;
      //delete item.files;
      save.call(item, (data) => {
        $scope.loading = false;

        notify('Сохранено', 'success');
        $state.go('profile.user.info', { username: data.account.username });
      }, (res) => {
        $scope.loading = false;
        $scope.error = res.data;
      });
    };

  }
}