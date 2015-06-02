import constructor from './constructor/constructor.js';
var appName = 'module.constructor';

var module = angular.module(appName, [
  constructor
]);

export default appName;