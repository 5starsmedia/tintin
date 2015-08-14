var appName = 'base.cabinet';

let module = angular.module(appName, [
  'ui.router'
]);

// controllers
import BaseCabinetCtrl from './controllers/BaseCabinetCtrl.js';

module.controller('BaseCabinetCtrl', BaseCabinetCtrl);

module.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/dashboard");
  $stateProvider
    .state('cabinet', {
      abstract: true,
      controller: 'BaseCabinetCtrl',
      templateUrl: "views/cabinet/master-page.html"
    })
    .state('cabinet.404', {
      templateUrl:  "views/cabinet/error-404.html",
      data: {
        pageTitle: 'Error 404',
        pageDesc: 'Page not found',
        hideTitle: true
      }
    });
});

export default appName;