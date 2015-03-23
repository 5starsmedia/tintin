var appName = 'module.base.permissions';

let module = angular.module(appName, [
]);

// factories
import BasePermissionModel from './models/BasePermissionModel.js';

module.factory('BasePermissionModel', BasePermissionModel);

import basePermissionsSet from './providers/basePermissionsSet.js';

module.provider('basePermissionsSet', basePermissionsSet);

export default appName;