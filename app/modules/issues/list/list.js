var appName = 'module.issues.list';

let module = angular.module(appName, [
  'base',
  'ui.router'
]);

// config
module.config(function ($stateProvider, basePermissionsSetProvider) {
  $stateProvider
    .state('issues', {
      abstract: true,
      parent: 'cabinet',
      template: '<div ui-view></div>'
    })
    .state('issues.list', {
      url: "/issues",
      templateUrl: "views/modules/issues/page-list.html",
      data: {
        pageTitle: 'Issues',
        hideTitle: true
      },
      resolve: {
        permissions: basePermissionsSetProvider.access(['issues'])
      }
    });
});

export default appName;