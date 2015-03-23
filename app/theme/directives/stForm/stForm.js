
function getFieldInfo(model, path) {
  return path.length === 1 ? model[path[0]] : getFieldInfo(model[path[0]], path.slice(1));
}

export default
  /*@ngInject*/
  function ($location) {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: {
      'onLeaveWarning': '=',
      'modelState': '=state',
      'model': '=',
      'submit': '&'
    },
    templateUrl: 'app/theme/directives/stForm/stForm.html',
    controller: function ($scope) {
      this.splitField = function (field) {
        var res = {};
        var lastDot = field.lastIndexOf('.');
        if (lastDot !== -1) {
          res.fieldPrefix = field.substr(0, lastDot);
          res.fieldName = field.substr(lastDot + 1);
        } else {
          res.fieldPrefix = '';
          res.fieldName = field;
        }
        return res;
      };
      this.getModelState = function () {
        return $scope.modelState;
      };
      this.getModel = function (field) {
        if (field.length === 0) {
          return $scope.model;
        } else {
          var spl = field.split('.');

          return getFieldInfo($scope.model, spl.length > 0 ? spl : [field]);
        }
      };
      $scope.submitForm = function() {
        if ($scope.submit) {
          $scope.submit();
        }
      };
      /*function routeChange(event, newUrl) {
        if (!$scope.onLeaveWarning) { return; }
        interactionSvc.confirmAlert('Confirmation', 'You have not saved changes will be lost, do you really want?',
          function () {
            onRouteChangeOff();
            newUrl = newUrl.substring(newUrl.replace('//', '').indexOf('/') + 2);
            $location.path(newUrl);
          });
        event.preventDefault();
      }
      var onRouteChangeOff = $scope.$on('$locationChangeStart', routeChange);
*/
    }
  };
}