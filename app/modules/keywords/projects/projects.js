var appName = 'module.keywords.projects';

import models from '../models/models.js';
import newsModels from '../../posts/models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'satellizer',
  'ngTable',
  'ui.select',
  'ngSanitize',
  'sticky',
  models,
  newsModels
]);

// controllers
import KeywordsProjectsCtrl from './controllers/KeywordsProjectsCtrl.js';
import KeywordsProjectEditCtrl from './controllers/KeywordsProjectEditCtrl.js';
import KeywordsGroupEditCtrl from './controllers/KeywordsGroupEditCtrl.js';
import KeywordsGroupsCtrl from './controllers/KeywordsGroupsCtrl.js';
import KeywordsBlockGroupsCtrl from './controllers/KeywordsBlockGroupsCtrl.js';

module.controller('KeywordsProjectsCtrl', KeywordsProjectsCtrl)
  .controller('KeywordsGroupsCtrl', KeywordsGroupsCtrl)
  .controller('KeywordsGroupEditCtrl', KeywordsGroupEditCtrl)
  .controller('KeywordsBlockGroupsCtrl', KeywordsBlockGroupsCtrl)
  .controller('KeywordsProjectEditCtrl', KeywordsProjectEditCtrl);


// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('keywords', {
      abstract: true,
      parent: 'cabinet',
      template: '<div ui-view></div>'
    })
    .state('keywords.projects', {
      url: "/keywords/projects",
      controller: 'KeywordsProjectsCtrl',
      templateUrl: "views/modules/keywords/page-projects.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      }
    })
    .state('keywords.projectView', {
      url: "/keywords/:id",
      controller: 'KeywordsGroupsCtrl',
      templateUrl: "views/modules/keywords/page-project-view.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        project: function($stateParams, KeywordsProjectModel) {
          return KeywordsProjectModel.get({ _id: $stateParams.id }).$promise;
        }
      }
    })
    .state('keywords.groupCreate', {
      url: "/keywords/:projectId/new",
      controller: 'KeywordsGroupEditCtrl',
      templateUrl: "views/modules/keywords/page-group.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        project: function($stateParams, KeywordsProjectModel) {
          return KeywordsProjectModel.get({ _id: $stateParams.projectId }).$promise;
        },
        group: function($stateParams, $q, KeywordsGroupModel) {
          var defer = $q.defer();

          defer.resolve(new KeywordsGroupModel({
            project: { _id: $stateParams.projectId },
            status: 'new'
          }));
          return defer.promise;
        }
      }
    })
    .state('keywords.groupEdit', {
      url: "/keywords/:projectId/:id",
      controller: 'KeywordsGroupEditCtrl',
      templateUrl: "views/modules/keywords/page-group.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        project: function($stateParams, KeywordsProjectModel) {
          return KeywordsProjectModel.get({ _id: $stateParams.projectId }).$promise;
        },
        group: function($stateParams, KeywordsGroupModel) {
          return KeywordsGroupModel.get({ _id: $stateParams.id }).$promise;
        }
      }
    })
});

export default appName;