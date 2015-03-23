/**
 * panelTools - Directive for panel tools elements in right corner of panel
 */

export default /*@ngInject*/ function panelTools($timeout) {
  return {
    restrict: 'A',
    scope: true,
    templateUrl: 'views/common/panel_tools.html',
    controller: /*@ngInject*/ function ($scope, $element) {
      // Function for collapse ibox
      $scope.showhide = function () {
        var hpanel = $element.closest('div.hpanel');
        var icon = $element.find('i:first');
        var body = hpanel.find('div.panel-body');
        var footer = hpanel.find('div.panel-footer');
        body.slideToggle(300);
        footer.slideToggle(200);
        // Toggle icon from up to down
        icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
        hpanel.toggleClass('').toggleClass('panel-collapse');
        $timeout(function () {
          hpanel.resize();
          hpanel.find('[id^=map-]').resize();
        }, 50);
      },

        // Function for close ibox
        $scope.closebox = function () {
          var hpanel = $element.closest('div.hpanel');
          hpanel.remove();
        }

    }
  };
};