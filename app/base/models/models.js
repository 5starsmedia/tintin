var appName = 'base.models';

var module = angular.module(appName, [
  'ngResource'
]);

// models
import BaseNotificationModel from './BaseNotificationModel.js';

module.factory('BaseNotificationModel', BaseNotificationModel);

export default appName;