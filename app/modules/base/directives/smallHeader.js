/**
 * smallHeader - Directive for page title panel
 */
export default /*@ngInject*/ function smallHeader() {
  return {
    restrict: 'A',
    scope:true,
    controller: /*@ngInject*/ function ($scope, $element) {
      $scope.small = function() {
        var icon = $element.find('i:first');
        var breadcrumb  = $element.find('#hbreadcrumb');
        $element.toggleClass('small-header');
        breadcrumb.toggleClass('m-t-lg');
        icon.toggleClass('fa-arrow-up').toggleClass('fa-arrow-down');
      }
    }
  }
}