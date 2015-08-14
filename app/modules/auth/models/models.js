var appName = 'module.auth.models';

var module = angular.module(appName, [
  'ngResource'
]);

// models
import AuthUserModel from './AuthUserModel.js';

module.factory('AuthUserModel', AuthUserModel);

export default appName;