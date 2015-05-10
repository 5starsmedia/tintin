var appName = 'module.keywords.text-unique';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'satellizer',
  'ngSanitize',
  'sticky',
  models
]);

// controllers
import KeywordsTextUniqueCtrl from './controllers/KeywordsTextUniqueCtrl.js';

module.controller('KeywordsTextUniqueCtrl', KeywordsTextUniqueCtrl);


// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('keywords.textUnique', {
      url: "/text-unique",
      controller: 'KeywordsTextUniqueCtrl',
      templateUrl: "views/modules/keywords/page-text-unique.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      }
    })
});

export default appName;