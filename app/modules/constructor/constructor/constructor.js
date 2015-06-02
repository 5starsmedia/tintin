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

//states
import SendNotificationCtrl from './controllers/states/SendNotificationCtrl.js';

module.controller('ConstructorConstructorCtrl', ConstructorConstructorCtrl)
  .controller('ConstructorEditStateCtrl', ConstructorEditStateCtrl)

  .controller('Constructor.SendNotificationCtrl', SendNotificationCtrl);

import constructorTree from './directives/constructorTree.js';
module.directive('constructorTree', constructorTree);

// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('ruleConstructor', {
      abstract: true,
      templateUrl: "views/common/content_small.html"
    })
    .state('ruleConstructor.main', {
      url: "/constructor",
      controller: 'ConstructorConstructorCtrl',
      templateUrl: "views/modules/constructor/page-constructor.html",
      data: {
        specialClass: 'constructor'
      }
    })
});

export default appName;