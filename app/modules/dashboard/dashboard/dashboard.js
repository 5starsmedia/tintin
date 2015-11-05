var appName = 'module.dashboard.dashboard';

let module = angular.module(appName, [
  'base',
  'ui.router'
]);

// config
module.config(function ($stateProvider, basePermissionsSetProvider) {
  $stateProvider
    .state('cabinet.dashboard', {
      url: "/dashboard",
      templateUrl: "views/dashboard.html",
      data: {
        pageTitle: 'Dashboard',
        hideTitle: true
      },
      resolve: {
        permissions: basePermissionsSetProvider.access([])
      }
    });
});

export default appName;