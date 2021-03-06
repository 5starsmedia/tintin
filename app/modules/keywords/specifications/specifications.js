var appName = 'module.keywords.specifications';

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
import KeywordsSpecificationsCtrl from './controllers/KeywordsSpecificationsCtrl.js';
import KeywordsSpecificationViewCtrl from './controllers/KeywordsSpecificationViewCtrl.js';
import KeywordsReturnTaskCtrl from './controllers/KeywordsReturnTaskCtrl.js';
import KeywordsSpecificationCheckUniqCtrl from './controllers/KeywordsSpecificationCheckUniqCtrl.js';

module.controller('KeywordsSpecificationsCtrl', KeywordsSpecificationsCtrl);
module.controller('KeywordsSpecificationViewCtrl', KeywordsSpecificationViewCtrl);
module.controller('KeywordsReturnTaskCtrl', KeywordsReturnTaskCtrl);
module.controller('KeywordsSpecificationCheckUniqCtrl', KeywordsSpecificationCheckUniqCtrl);


// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('keywords.specifications', {
      url: "/specifications",
      controller: 'KeywordsSpecificationsCtrl',
      templateUrl: "views/modules/keywords/specifications/page-list.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      }
    })
    .state('keywords.specificationsView', {
      url: "/specifications/:_id",
      controller: 'KeywordsSpecificationViewCtrl',
      templateUrl: "views/modules/keywords/specifications/page-view.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        group: /*@ngInject*/ ($stateParams, KeywordsPublicationModel) => {
          return KeywordsPublicationModel.get({ _id: $stateParams._id }).$promise;
        }
      }
    })
});

export default appName;