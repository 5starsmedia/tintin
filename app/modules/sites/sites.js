import domains from './domains/domains';

var appName = 'module.sites';

var module = angular.module(appName, [
  domains
]);

export default appName;