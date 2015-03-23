var appName = 'module.users.models';

var module = angular.module(appName, [
  'ngResource'
]);

// models
import UserAccountModel from './UserAccountModel.js';
import UserLogRecordModel from './UserLogRecordModel.js';

module.factory('UserAccountModel', UserAccountModel)
      .factory('UserLogRecordModel', UserLogRecordModel);

export default appName;