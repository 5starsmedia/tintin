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
import KeywordsMasterCtrl from './controllers/KeywordsMasterCtrl.js';
import KeywordsGroupEditCtrl from './controllers/KeywordsGroupEditCtrl.js';
import KeywordsGroupsCtrl from './controllers/KeywordsGroupsCtrl.js';
import KeywordsBlockGroupsCtrl from './controllers/KeywordsBlockGroupsCtrl.js';
import KeywordsGroupAssignCtrl from './controllers/KeywordsGroupAssignCtrl.js';

module
  .controller('KeywordsMasterCtrl', KeywordsMasterCtrl)
  .controller('KeywordsGroupsCtrl', KeywordsGroupsCtrl)
  .controller('KeywordsGroupEditCtrl', KeywordsGroupEditCtrl)
  .controller('KeywordsGroupAssignCtrl', KeywordsGroupAssignCtrl)
  .controller('KeywordsBlockGroupsCtrl', KeywordsBlockGroupsCtrl)
;


import keywordsStatus from './directives/keywordsStatus.js';
import specificationPreviewLink from './directives/specificationPreviewLink.js';

module.directive('keywordsStatus', keywordsStatus);
module.directive('specificationPreviewLink', specificationPreviewLink);

// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('keywords', {
      abstract: true,
      parent: 'cabinet',
      templateUrl: 'views/modules/keywords/master-view.html',
      controller: 'KeywordsMasterCtrl'
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