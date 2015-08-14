var appName = 'module.users.models';

var module = angular.module(appName, [
  'ngResource'
]);

// models
import UserAccountModel from './UserAccountModel.js';
import UserLogRecordModel from './UserLogRecordModel.js';
import UserRoleModel from './UserRoleModel.js';
import UserPermissionModel from './UserPermissionModel.js';

module.factory('UserAccountModel', UserAccountModel)
      .factory('UserLogRecordModel', UserLogRecordModel)
      .factory('UserRoleModel', UserRoleModel)
      .factory('UserPermissionModel', UserPermissionModel);

export default appName;