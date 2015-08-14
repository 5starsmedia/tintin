export default
  /*@ngInject*/
  () => {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'views/modules/users/directive-usersSelectBox.html',
      scope: {
        'account': '='
      },
      controller: /*@ngInject*/ ($scope, UserAccountModel) => {
        $scope.loading = true;
        UserAccountModel.query({ page: 1, perPage: 100, fields: 'title,username,coverFile,imageUrl' }, function (res, headers) {
          $scope.loading = false;

          $scope.accounts = res;
        }, function () {
          $scope.loading = false;
        });
      },
      link: function(scope) {
      }
    };
  }