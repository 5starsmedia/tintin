import domains from './domains/domains';
import settings from './settings/settings';
import exportImport from './export-import/export-import';
import dns from './dns/dns';

var appName = 'module.sites';

var module = angular.module(appName, [
  domains,
  settings,
  exportImport,
  dns
]);

export default appName;