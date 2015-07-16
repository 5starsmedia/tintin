var appName = 'module.news.dashboard';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.bootstrap.popover',
  'ui.router',
  'satellizer',
  'ngTable',
  'ngCkeditor',
  'ui.select',
  'ngSanitize',
  'sticky',
  models
]);

import newsDashboardCreators from './directives/newsDashboardCreators.js';

module.directive('newsDashboardCreators', newsDashboardCreators);


export default appName;