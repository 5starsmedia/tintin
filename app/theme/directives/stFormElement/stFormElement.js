export default
  /*@ngInject*/
  function () {
    return {
      require: '^stForm',
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        'field': '@',
        'label': '@'
      },
      templateUrl: 'app/theme/directives/stFormElement/stFormElement.html',
      link: function (scope, element, attrs, stForm) {
        var getModelState = stForm.getModelState;
        scope.fieldErrors = function (field) {
          return _.filter(getModelState().fieldErrors, {field: field});
        };
        scope.hasErrors = function (field) {
          var modelState = getModelState();
          return modelState && modelState.hasErrors && modelState.fieldErrors && modelState.fieldErrors.length > 0 &&
          _.filter(modelState.fieldErrors, {field: field}).length > 0;
        };
      }
    };
}