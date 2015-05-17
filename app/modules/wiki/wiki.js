import pages from './pages/pages';

var appName = 'module.wiki';

var module = angular.module(appName, [
  pages
]);

export default appName;