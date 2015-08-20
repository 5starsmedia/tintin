import domains from './domains/domains';
import settings from './settings/settings';
import dns from './dns/dns';

var appName = 'module.sites';

var module = angular.module(appName, [
  domains,
  settings,
  dns
]);

export default appName;