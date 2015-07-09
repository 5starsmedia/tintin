export default
  /*@ngInject*/
  function ($parse, $window) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        account: '=',
        width: '@',
        height: '@'
      },
      templateUrl: 'app/theme/directives/stAvatar/stAvatar.html',
      controller: /*@ngInject*/ function ($scope) {
      if (!$scope.width) {
        $scope.width = 200;
      }
      if (!$scope.height) {
        //noinspection JSSuspiciousNameCombination
        $scope.height = $scope.width;
      }
      function getAvatar() {
        if ($scope.account) {
          if ($scope.account.coverFile && $scope.account.coverFile._id) {
            return '/api/files/' + $scope.account.coverFile._id;//, {width: $scope.width, height: $scope.height};
          } else if ($scope.account.imageUrl) {
            return $scope.account.imageUrl;
          }
        }
      }

      $scope.accountUrl = getAvatar();
    }
    };
  }