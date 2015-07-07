function getFieldInfo(model, path) {
  return path.length === 1 ? model[path[0]] : getFieldInfo(model[path[0]], path.slice(1));
}

class stFormController {
  /*@ngInject*/
  constructor($scope) {
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
    $scope.submitForm = function () {
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
}

export default
  /*@ngInject*/
  function ($interval) {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        'onLeaveWarning': '=',
        'modelState': '=state',
        'model': '=',
        'submit': '&',
        'autoSave': '&',
        'autoSaveMode': '@',
        'autoSaveInterval': '@'
      },
      templateUrl: 'app/theme/directives/stForm/stForm.html',
      controller: stFormController,

      // autosave
      link: function($scope, $element, $attrs) {
        var latestModel = null;
        var hasModel = !!$scope.model;
        var autoSaveMode = $scope.autoSaveMode;
        var autoSaveInterval = parseInt($scope.autoSaveInterval) * 1;
        latestModel = angular.copy($scope.model);
        var intervalPromise = null;

        function blurHandler() {
          $scope.$apply(function() {
            $scope.autoSave();
          });
        }

        if(autoSaveMode === 'interval') {
          intervalPromise = $interval(function() {
            if(!hasModel || !angular.equals(latestModel, $scope.model)) {
              latestModel = angular.copy($scope.model);
              $scope.autoSave();
            }
          }, autoSaveInterval);
        } else if (autoSaveMode === 'blur') {
          $element.find('input').on('blur', blurHandler);
        }

        $element.on('$destroy', function(event) {
          if(intervalPromise) {
            $interval.cancel(intervalPromise);
          }
          if (autoSaveMode === 'blur') {
            $element.find('input').off('blur', blurHandler);
          }
        });
      }
    };
  }