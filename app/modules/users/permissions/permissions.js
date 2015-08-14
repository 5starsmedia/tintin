var appName = 'module.users.permissions';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'satellizer',
  'ngTable',
  models
]);

// controllers
import UsersPermissionsCtrl from './controllers/UsersPermissionsCtrl.js';

module.controller('UsersPermissionsCtrl', UsersPermissionsCtrl);

// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('users.permissions', {
      templateUrl: 'views/modules/users/page-permissions.html',
      controller: 'UsersPermissionsCtrl'
    });
});

export default appName;