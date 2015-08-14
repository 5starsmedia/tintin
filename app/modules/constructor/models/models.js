var appName = 'module.constructor.models';

var module = angular.module(appName, [
  'ngResource',
  'ngEditableTree'
]);

// models
import ConstructorStateModel from './ConstructorStateModel.js';

module.factory('ConstructorStateModel', ConstructorStateModel);

export default appName;