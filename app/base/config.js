export default
  /*@ngInject*/
  function configState($stateProvider, $urlRouterProvider, $compileProvider, basePermissionsSetProvider, $locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true);

    $httpProvider.interceptors.push('UnknownDomainInterceptor');

    // Optimize load start with remove binding information inside the DOM element
    //$compileProvider.debugInfoEnabled(false);

    $urlRouterProvider.otherwise("/dashboard");
    $stateProvider
      .state('cabinet', {
        abstract: true,
        templateUrl: "views/cabinet/master-page.html"
      })
      .state('cabinet.404', {
        templateUrl:  "views/cabinet/error-404.html",
        data: {
          pageTitle: 'Error 404',
          pageDesc: 'Page not found',
          hideTitle: true
        }
      })
      .state('error-418', {
        templateUrl:  "views/cabinet/error-418.html",
        data: {
          pageTitle: 'Error 418',
          pageDesc: 'Site not found',
          hideTitle: true
        }
      });
  }