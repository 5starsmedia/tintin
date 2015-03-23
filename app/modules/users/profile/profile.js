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

module.controller('UsersProfileBlockCtrl', UsersProfileBlockCtrl);
module.controller('UsersProfileLogCtrl', UsersProfileLogCtrl);
module.controller('UsersProfileCtrl', UsersProfileCtrl);


// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('profile', {
      abstract: true,
      url: "/profile",
      templateUrl: "views/common/content.html"
    })
    .state('profile.user', {
      url: '/:username',
      abstract: true,
      templateUrl: 'views/modules/profile/page-profile.html',
      controller: 'UsersProfileCtrl',
      data: {
        pageTitle: 'Profile'
      }
    })
    .state('profile.user.info', {
      url: '/info',
      templateUrl: 'views/modules/profile/tab-info.html',
      data: {
        pageTitle: 'Info',
        pageDesc: 'Test'
      }
    })
    .state('profile.user.log', {
      url: '/log',
      templateUrl: 'views/modules/profile/tab-log.html',
      controller: 'UsersProfileLogCtrl',
      data: {
        pageTitle: 'Log',
        pageDesc: 'Test'
      }
    });
});

export default appName;