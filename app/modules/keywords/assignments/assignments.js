var appName = 'module.keywords.assignments';

import models from '../models/models.js';
import newsModels from '../../news/models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'satellizer',
  'ngTable',
  'ui.select',
  'ngSanitize',
  'sticky',
  'datePicker',
  models,
  newsModels
]);

// controllers
import KeywordsAssignmentsCtrl from './controllers/KeywordsAssignmentsCtrl.js';
import KeywordsAssignmentsViewCtrl from './controllers/KeywordsAssignmentsViewCtrl.js';

module.controller('KeywordsAssignmentsCtrl', KeywordsAssignmentsCtrl);
module.controller('KeywordsAssignmentsViewCtrl', KeywordsAssignmentsViewCtrl);


// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('keywords.assignments', {
      url: "/assignments",
      controller: 'KeywordsAssignmentsCtrl',
      templateUrl: "views/modules/keywords/assignments/page-list.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      }
    })
    .state('keywords.assignmentsView', {
      url: "/assignments/:id",
      controller: 'KeywordsAssignmentsViewCtrl',
      templateUrl: "views/modules/keywords/assignments/page-view.html",
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