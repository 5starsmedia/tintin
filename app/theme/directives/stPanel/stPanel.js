export default
  /*@ngInject*/
  function () {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: true,
      templateUrl: 'app/theme/directives/stPanel/stPanel.html',
      link: (scope, element, attrs) => {

        scope.$watch(attrs.isRed, (value) => {
          scope.isRed = value;
        });
        scope.$watch(attrs.isYellow, (value) => {
          scope.isYellow = value;
        });
        scope.$watch(attrs.isGreen, (value) => {
          scope.isGreen = value;
        });
        scope.$watch(attrs.isPrimary, (value) => {
          scope.isPrimary = value;
        });
        scope.title = attrs.title;
      }
    };
  }