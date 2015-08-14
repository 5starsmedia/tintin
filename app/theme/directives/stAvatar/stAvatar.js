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
            var url = '/api/files/' + $scope.account.coverFile._id + '?i';
            if ($scope.width) {
              url += '&width=' + $scope.width;
            }
            if ($scope.height) {
              url += '&height=' + $scope.height;
            }
            return url;
          } else if ($scope.account.imageUrl) {
            return $scope.account.imageUrl;
          } else {
            return 'assets/img/defaultuser.jpg';
          }
        }
      }

      $scope.accountUrl = getAvatar();
    }
    };
  }