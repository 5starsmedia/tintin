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
  'datePicker',
  models
]);

// controllers
import KeywordsSpecificationsCtrl from './controllers/KeywordsSpecificationsCtrl.js';
import KeywordsSpecificationViewCtrl from './controllers/KeywordsSpecificationViewCtrl.js';

module.controller('KeywordsSpecificationsCtrl', KeywordsSpecificationsCtrl);
module.controller('KeywordsSpecificationViewCtrl', KeywordsSpecificationViewCtrl);


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
      url: "/specifications/:id",
      controller: 'KeywordsSpecificationViewCtrl',
      templateUrl: "views/modules/keywords/specifications/page-view.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        group: function($stateParams, KeywordsGroupModel) {
          return KeywordsGroupModel.get({ _id: $stateParams.id }).$promise;
        }
      }
    })
});

export default appName;