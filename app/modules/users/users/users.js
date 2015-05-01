var appName = 'module.users.users';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'satellizer',
  'ngTable',
  models
]);

// controllers
import UsersUserListCtrl from './controllers/UsersUserListCtrl.js';
import UsersUserCreateCtrl from './controllers/UsersUserCreateCtrl.js';

module.controller('UsersUserListCtrl', UsersUserListCtrl);
module.controller('UsersUserCreateCtrl', UsersUserCreateCtrl);

// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('users', {
      abstract: true,
      templateUrl: "views/common/content_small.html"
    })
    .state('users.list', {
      url: '/users',
      templateUrl: 'views/modules/users/page-users.html',
      controller: 'UsersUserListCtrl',
      data: {
        pageTitle: 'Users'
      }
    })
    .state('users.create', {
      url: '/users/new',
      templateUrl: 'views/modules/users/page-create.html',
      controller: 'UsersUserCreateCtrl',
      data: {
        pageTitle: 'Users'
      }
    });
});

export default appName;