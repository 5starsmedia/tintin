var appName = 'module.users.profile';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'satellizer',
  'ngTable',
  models
]);

// factories
import UsersProfileSrv from './services/UsersProfileSrv.js';

module.factory('UsersProfileSrv', UsersProfileSrv);

// controllers
import UsersProfileCtrl from './controllers/UsersProfileCtrl.js';
import UsersProfileLogCtrl from './controllers/UsersProfileLogCtrl.js';
import UsersProfileBlockCtrl from './controllers/UsersProfileBlockCtrl.js';
import UsersProfileInfoCtrl from './controllers/UsersProfileInfoCtrl.js';
import UsersProfileChangePasswordCtrl from './controllers/UsersProfileChangePasswordCtrl.js';

module.controller('UsersProfileBlockCtrl', UsersProfileBlockCtrl);
module.controller('UsersProfileLogCtrl', UsersProfileLogCtrl);
module.controller('UsersProfileInfoCtrl', UsersProfileInfoCtrl);
module.controller('UsersProfileCtrl', UsersProfileCtrl);
module.controller('UsersProfileChangePasswordCtrl', UsersProfileChangePasswordCtrl);


// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('profile', {
      abstract: true,
      url: "/profile",
      parent: 'cabinet',
      template: '<div ui-view></div>'
    })
    .state('profile.user', {
      url: '/:username',
      abstract: true,
      templateUrl: 'views/modules/users/profile/page-profile.html',
      controller: 'UsersProfileCtrl',
      data: {
        pageTitle: 'Profile'
      },
      resolve: {
        user: ($stateParams, $q, UserAccountModel) => {
          var defer = $q.defer();
          UserAccountModel.query({ username: $stateParams.username, page: 1, perPage: 1 }, function(users) {
            if (!users.length) {

            }
            defer.resolve(users[0]);
          });
          return defer.promise;
        }
      }
    })
    .state('profile.user.info', {
      url: '/info',
      templateUrl: 'views/modules/users/profile/tab-info.html',
      controller: 'UsersProfileInfoCtrl',
      data: {
        pageTitle: 'Info',
        pageDesc: 'Test'
      }
    })
    .state('profile.user.log', {
      url: '/log',
      templateUrl: 'views/modules/users/profile/tab-log.html',
      controller: 'UsersProfileLogCtrl',
      data: {
        pageTitle: 'Log',
        pageDesc: 'Test'
      }
    })
    .state('profile.user.password', {
      url: '/password',
      templateUrl: 'views/modules/users/profile/tab-password.html',
      controller: 'UsersProfileChangePasswordCtrl',
      data: {
        pageTitle: 'Password',
        pageDesc: 'Test'
      }
    });
});

export default appName;