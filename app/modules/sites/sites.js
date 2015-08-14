import domains from './domains/domains';
import settings from './settings/settings';
import languages from './languages/languages';

var appName = 'module.sites';

var module = angular.module(appName, [
  domains,
  settings,
  languages
]);

export default appName;