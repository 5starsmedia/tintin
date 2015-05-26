var appName = 'module.servers.models';

var module = angular.module(appName, [
  'ngResource'
]);

// models
import ServersNodeServerModel from './ServersNodeServerModel.js';

module.factory('ServersNodeServerModel', ServersNodeServerModel);

export default appName;