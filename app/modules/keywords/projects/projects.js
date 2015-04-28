var appName = 'module.keywords.projects';

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
import KeywordsProjectsCtrl from './controllers/KeywordsProjectsCtrl.js';
import KeywordsProjectEditCtrl from './controllers/KeywordsProjectEditCtrl.js';
import KeywordsGroupEditCtrl from './controllers/KeywordsGroupEditCtrl.js';
import KeywordsGroupsCtrl from './controllers/KeywordsGroupsCtrl.js';

module.controller('KeywordsProjectsCtrl', KeywordsProjectsCtrl)
  .controller('KeywordsGroupsCtrl', KeywordsGroupsCtrl)
  .controller('KeywordsGroupEditCtrl', KeywordsGroupEditCtrl)
  .controller('KeywordsProjectEditCtrl', KeywordsProjectEditCtrl);


// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('keywords', {
      abstract: true,
      templateUrl: "views/common/content_small.html"
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
    .state('keywords.projectCreate', {
      url: "/keywords/projects/new",
      controller: 'KeywordsProjectEditCtrl',
      templateUrl: "views/modules/keywords/page-edit.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        project: ($stateParams, $q, KeywordsProjectModel) => {
          var defer = $q.defer();

          defer.resolve(new KeywordsProjectModel({
          }));
          return defer.promise;
        }
      }
    })
    .state('keywords.projectEdit', {
      url: "/keywords/:id",
      controller: 'KeywordsGroupsCtrl',
      templateUrl: "views/modules/keywords/page-edit.html",
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
            project: { _id: $stateParams.projectId }
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