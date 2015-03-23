export default
  /*@ngInject*/
  function ($location) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      'label': '@',
      'description': '@',
      'warningDescription': '@',
      'success': '=',
      'warning': '='
    },
    templateUrl: 'app/theme/directives/stChecklistItem/stChecklistItem.html',
    controller: () => {
    }
  };
}