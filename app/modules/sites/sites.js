import domains from './domains/domains';
import settings from './settings/settings';
import exportImport from './export-import/export-import';
import dns from './dns/dns';
import redirects from './redirects/redirects';

var appName = 'module.sites';

var module = angular.module(appName, [
  domains,
  settings,
  exportImport,
  dns,
  redirects
]);

export default appName;