export default
  /*@ngInject*/
  function configState($stateProvider, $compileProvider, basePermissionsSetProvider, $locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true);

    $httpProvider.interceptors.push('UnknownDomainInterceptor');

    // Optimize load start with remove binding information inside the DOM element
    //$compileProvider.debugInfoEnabled(false);

    $stateProvider
      .state('error-418', {
        templateUrl:  "views/cabinet/error-418.html",
        data: {
          pageTitle: 'Error 418',
          pageDesc: 'Site not found',
          hideTitle: true
        }
      });
  }