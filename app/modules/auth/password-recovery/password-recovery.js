let appName = 'module.auth.password-recovery';

import models from '../models/models.js';

let module = angular.module(appName, [
  'ui.router',
  'satellizer',
  models
]);

// controllers
import PasswordRecoveryCtrl from './controllers/PasswordRecoveryCtrl.js';
import PasswordRecoveryConfirmCtrl from './controllers/PasswordRecoveryConfirmCtrl.js';
module.controller('PasswordRecoveryCtrl', PasswordRecoveryCtrl)
  .controller('PasswordRecoveryConfirmCtrl', PasswordRecoveryConfirmCtrl);

// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('auth.password-recovery', {
      url: '/password-recovery',
      templateUrl: 'views/modules/auth/page-password-recovery.html',
      controller: 'PasswordRecoveryCtrl'
    })
    .state('auth.password-confirm', {
      url: '/password-confirm?token',
      templateUrl: 'views/modules/auth/page-password-confirm.html',
      controller: 'PasswordRecoveryConfirmCtrl'
    });
});

export default appName;