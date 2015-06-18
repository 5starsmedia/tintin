var appName = 'base.models';

var module = angular.module(appName, [
  'ngResource'
]);

// models
import BaseNotificationModel from './BaseNotificationModel.js';
import BaseMenuModel from './BaseMenuModel.js';

module.factory('BaseNotificationModel', BaseNotificationModel);
module.factory('BaseMenuModel', BaseMenuModel);

export default appName;