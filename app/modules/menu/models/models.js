var appName = 'module.menu.models';

var module = angular.module(appName, [
  'ngResource'
]);

// models
import MenuElementModel from './MenuElementModel.js';

module.factory('MenuElementModel', MenuElementModel);

export default appName;