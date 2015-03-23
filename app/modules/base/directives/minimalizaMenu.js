/**
 * minimalizaSidebar - Directive for minimalize sidebar
 */
export default /*@ngInject*/ function minimalizaMenu($rootScope) {
  return {
    restrict: 'EA',
    template: '<div class="header-link hide-menu" ng-click="minimalize()"><i class="fa fa-bars"></i></div>',
    controller: /*@ngInject*/ function ($scope, $element) {

      $scope.minimalize = function () {
        if ($(window).width() < 769) {
          $("body").toggleClass("show-sidebar");
        } else {
          $("body").toggleClass("hide-sidebar");
        }
      }
    }
  };
};