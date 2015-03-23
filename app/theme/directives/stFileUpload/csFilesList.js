export default
  /*@ngInject*/
  function () {
    return {
      templateUrl: 'app/theme/directives/stFileUpload/csFilesList.html',
      restrict: 'E',
      replace: true,
      scope: {
        files: '='
      },
      controller: function ($scope) {
        $scope.files = $scope.files || [];
      }
    };
  }