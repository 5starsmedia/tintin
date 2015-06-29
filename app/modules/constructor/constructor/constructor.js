var appName = 'module.constructor.constructor';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'satellizer',
  models
]);

// controllers
import ConstructorConstructorCtrl from './controllers/ConstructorConstructorCtrl.js';
import ConstructorEditStateCtrl from './controllers/ConstructorEditStateCtrl.js';
import ConstructorEventCtrl from './controllers/ConstructorEventCtrl.js';

//states
import SendNotificationCtrl from './controllers/states/SendNotificationCtrl.js';

module.controller('ConstructorConstructorCtrl', ConstructorConstructorCtrl)
  .controller('ConstructorEditStateCtrl', ConstructorEditStateCtrl)
  .controller('ConstructorEventCtrl', ConstructorEventCtrl)

  .controller('Constructor.SendNotificationCtrl', SendNotificationCtrl);

import constructorTree from './directives/constructorTree.js';
module.directive('constructorTree', constructorTree);

// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('ruleConstructor', {
      abstract: true,
      parent: 'cabinet',
      template: '<div ui-view></div>'
    })
    .state('ruleConstructor.main', {
      url: "/constructor",
      controller: 'ConstructorConstructorCtrl',
      templateUrl: "views/modules/constructor/page-constructor.html",
      data: {
        specialClass: 'constructor'
      }
    })
    .state('ruleConstructor.event', {
      parent: 'ruleConstructor.main',
      url: "/:eventType",
      controller: 'ConstructorEventCtrl',
      templateUrl: "views/modules/constructor/page-event.html",
      data: {
        specialClass: 'constructor'
      },
      resolve: {
        eventType: ($stateParams) => $stateParams.eventType
      }
    })
});

export default appName;