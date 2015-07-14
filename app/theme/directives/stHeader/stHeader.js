export default
  /*@ngInject*/
  function () {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: true,
      templateUrl: 'app/theme/directives/stHeader/stHeader.html',
      link: (scope, element, attrs) => {

        scope.title = attrs.title;
      }
    };
  }