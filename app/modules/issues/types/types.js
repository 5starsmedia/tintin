var appName = 'module.issues.types';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  models
]);


// controllers
import IssuesTypesListCtrl from './controllers/IssuesTypesListCtrl.js';
import IssuesTypesEditCtrl from './controllers/IssuesTypesEditCtrl.js';

module.controller('IssuesTypesListCtrl', IssuesTypesListCtrl)
      .controller('IssuesTypesEditCtrl', IssuesTypesEditCtrl);

// config
module.config(function ($stateProvider, basePermissionsSetProvider) {
  $stateProvider
    .state('issues', {
      abstract: true,
      parent: 'cabinet',
      template: '<div ui-view></div>'
    })
    .state('issues.types', {
      url: "/issues/types",
      controller: 'IssuesTypesListCtrl',
      templateUrl: "views/modules/issues/types/page-list.html",
      data: {
        pageTitle: 'Issues',
        hideTitle: true
      },
      resolve: {
        permissions: basePermissionsSetProvider.access(['issues'])
      }
    })
    .state('issues.types.create', {
      url: "/new",
      controller: 'IssuesTypesEditCtrl',
      templateUrl: "views/modules/issues/types/page-edit.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        item: ($stateParams, $q, IssuesTypeModel) => {
          var defer = $q.defer();

          defer.resolve(new IssuesTypeModel({
            statuses: []
          }));
          return defer.promise;
        }
      }
    })
    .state('issues.types.edit', {
      url: "/:id",
      controller: 'IssuesTypesEditCtrl',
      templateUrl: "views/modules/issues/types/page-edit.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        item: function($stateParams, IssuesTypeModel) {
          return IssuesTypeModel.get({ _id: $stateParams.id }).$promise;
        }
      }
    });
});

export default appName;