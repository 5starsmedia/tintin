var appName = 'module.keywords.check';

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
import KeywordsCheckCtrl from './controllers/KeywordsCheckCtrl.js';
import KeywordsCheckViewCtrl from './controllers/KeywordsCheckViewCtrl.js';

module.controller('KeywordsCheckCtrl', KeywordsCheckCtrl);
module.controller('KeywordsCheckViewCtrl', KeywordsCheckViewCtrl);

// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('keywords.check', {
      url: "/check",
      controller: 'KeywordsCheckCtrl',
      templateUrl: "views/modules/keywords/check/page-list.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      }
    })
    .state('keywords.checkView', {
      url: "/check/:_id",
      controller: 'KeywordsCheckViewCtrl',
      templateUrl: "views/modules/keywords/check/page-view.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        group: /*@ngInject*/ ($stateParams, KeywordsPublicationModel) => {
          console.info($stateParams._id)
          return KeywordsPublicationModel.get({ _id: $stateParams._id }).$promise;
        }
      }
    });
});

export default appName;