import domains from './domains/domains';
import settings from './settings/settings';

var appName = 'module.sites';

var module = angular.module(appName, [
  domains,
  settings
]);

export default appName;