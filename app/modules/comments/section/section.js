var appName = 'module.comments.section';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'satellizer',
  'ngTable',
  'ui.select',
  'ngSanitize',
  models
]);

// controllers
import CommentsSectionSettingsCtrl from './controllers/CommentsSectionSettingsCtrl.js';

module
    .controller('CommentsSectionSettingsCtrl', CommentsSectionSettingsCtrl)
;

// config
module.config(function ($stateProvider) {
});

export default appName;