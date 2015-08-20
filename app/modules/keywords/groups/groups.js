var appName = 'module.keywords.groups';

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
import KeywordsGroupEditCtrl from './controllers/KeywordsGroupEditCtrl.js';
import KeywordsGroupsCtrl from './controllers/KeywordsGroupsCtrl.js';
import KeywordsBlockGroupsCtrl from './controllers/KeywordsBlockGroupsCtrl.js';

module.controller('KeywordsGroupsCtrl', KeywordsGroupsCtrl)
  .controller('KeywordsGroupEditCtrl', KeywordsGroupEditCtrl)
  .controller('KeywordsBlockGroupsCtrl', KeywordsBlockGroupsCtrl);


import keywordsStatus from './directives/keywordsStatus.js';

module.directive('keywordsStatus', keywordsStatus);

// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('keywords', {
      abstract: true,
      parent: 'cabinet',
      templateUrl: 'views/modules/keywords/master-view.html'
      //template: '<div ui-view></div>'
    })
    .state('keywords.groups', {
      url: "/keywords/groups",
      controller: 'KeywordsGroupsCtrl',
      templateUrl: "views/modules/keywords/page-groups.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      }
    })
    .state('keywords.groupCreate', {
      url: "/keywords/groups/new",
      controller: 'KeywordsGroupEditCtrl',
      templateUrl: "views/modules/keywords/page-group.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        group: function($stateParams, $q, KeywordsGroupModel) {
          var defer = $q.defer();

          defer.resolve(new KeywordsGroupModel({
            status: 'new'
          }));
          return defer.promise;
        }
      }
    })
    .state('keywords.groupEdit', {
      url: "/keywords/groups/:id",
      controller: 'KeywordsGroupEditCtrl',
      templateUrl: "views/modules/keywords/page-group.html",
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