/**
 * sideNavigation - Directive for run metsiMenu on sidebar navigation
 */
export default /*@ngInject*/ function sideNavigation($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      // Call the metsiMenu plugin and plug it to sidebar navigation
      element.metisMenu();


    }
  };
};