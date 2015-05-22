var appName = 'module.users.roles';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'satellizer',
  'ngTable',
  models
]);

// controllers
import UsersRolesListCtrl from './controllers/UsersRolesListCtrl.js';
import UsersRolesEditCtrl from './controllers/UsersRolesEditCtrl.js';

module.controller('UsersRolesListCtrl', UsersRolesListCtrl)
  .controller('UsersRolesEditCtrl', UsersRolesEditCtrl);

// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('users.roles', {
      url: '/roles',
      templateUrl: 'views/modules/users/roles/page-roles.html',
      controller: 'UsersRolesListCtrl',
      data: {
        pageTitle: 'Roles'
      }
    })
    .state('users.roles.create', {
      url: '/new',
      templateUrl: 'views/modules/users/roles/page-edit.html',
      controller: 'UsersRolesEditCtrl',
      data: {
        pageTitle: 'Roles'
      },
      resolve: {
        role: ($stateParams, $q, UserRoleModel) => {
          var defer = $q.defer();
          defer.resolve(new UserRoleModel());
          return defer.promise;
        }
      }
    })
    .state('users.roles.edit', {
      url: "/:_id",
      controller: 'UsersRolesEditCtrl',
      templateUrl: "views/modules/users/roles/page-edit.html",
      data: {
        pageTitle: 'Roles',
        hideTitle: true
      },
      resolve: {
        role: ($stateParams, UserRoleModel) => {
          return UserRoleModel.get({ _id: $stateParams._id }).$promise;
        }
      }
    });
});

export default appName;