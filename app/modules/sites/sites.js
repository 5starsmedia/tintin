import domains from './domains/domains';
import settings from './settings/settings';
import dns from './dns/dns';
import languages from './languages/languages';

var appName = 'module.sites';

var module = angular.module(appName, [
  domains,
  settings,
  dns,
  languages
]);

export default appName;