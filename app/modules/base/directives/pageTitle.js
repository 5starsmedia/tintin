export default /*@ngInject*/ function pageTitle($rootScope, $timeout) {
  return {
    link: function(scope, element) {
      var listener = function(event, toState, toParams, fromState, fromParams) {
        // Default title
        var title = 'HOMER | AngularJS Responsive WebApp';
        // Create your own title pattern
        if (toState.data && toState.data.pageTitle) title = 'HOMER | ' + toState.data.pageTitle;
        $timeout(function() {
          element.text(title);
        });
      };
      $rootScope.$on('$stateChangeStart', listener);
    }
  }
};
