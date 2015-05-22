export default
  /*@ngInject*/
  function configState($stateProvider, $urlRouterProvider, $compileProvider, basePermissionsSetProvider, $locationProvider) {

    $locationProvider.html5Mode(true)

    // Optimize load start with remove binding information inside the DOM element
    //$compileProvider.debugInfoEnabled(false);

    // Set default state
    $urlRouterProvider.otherwise("/dashboard");
    $stateProvider

      .state('error', {
        abstract: true,
        templateUrl: "views/common/content.html"
      })
      .state('error.404', {
        templateUrl:  "views/common_app/error_one.html",
        data: {
          pageTitle: 'Error 404',
          pageDesc: 'Page not found',
          hideTitle: true
        }
      })

      // Dashboard - Main page
      .state('dashboard', {
        url: "/dashboard",
        templateUrl: "views/dashboard.html",
        data: {
          pageTitle: 'Dashboard'
        },
        resolve: {
          permissions: basePermissionsSetProvider.access(['auth.login'])
        }
      })

      // App views
      .state('app_views', {
        abstract: true,
        url: "/app_views",
        templateUrl: "views/common/content.html",
        data: {
          pageTitle: 'App Views'
        }
      })

      // Common views
      .state('common', {
        abstract: true,
        url: "/common",
        templateUrl: "views/common/content_empty.html",
        data: {
          pageTitle: 'Common'
        }
      })
      .state('common.register', {
        url: "/register",
        templateUrl: "views/common_app/register.html",
        data: {
          pageTitle: 'Register page',
          specialClass: 'blank'
        }
      })
      .state('common.error_one', {
        url: "/error_one",
        templateUrl: "views/common_app/error_one.html",
        data: {
          pageTitle: 'Error 404',
          specialClass: 'blank'
        }
      })
      .state('common.error_two', {
        url: "/error_two",
        templateUrl: "views/common_app/error_two.html",
        data: {
          pageTitle: 'Error 505',
          specialClass: 'blank'
        }
      })
      .state('common.lock', {
        url: "/lock",
        templateUrl: "views/common_app/lock.html",
        data: {
          pageTitle: 'Lock page',
          specialClass: 'blank'
        }
      })
  }