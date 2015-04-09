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
      controller: /*@ngInject*/ ($scope) => {
        $scope.files = $scope.files || [];
      }
    };
  }