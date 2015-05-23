var appName = 'module.keywords.seo';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'satellizer',
  'ngTable',
  'ui.select',
  'ngSanitize',
  'sticky',
  models
]);

// controllers
import KeywordsSeoBlockCtrl from './controllers/KeywordsSeoBlockCtrl.js';

module.controller('KeywordsSeoBlockCtrl', KeywordsSeoBlockCtrl);

// config
module.config(($stateProvider) => {
});

export default appName;