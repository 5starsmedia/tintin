var appName = 'module.issues.list';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  models
]);


// controllers
import IssuesListCtrl from './controllers/IssuesListCtrl.js';
import IssuesEditCtrl from './controllers/IssuesEditCtrl.js';

module.controller('IssuesListCtrl', IssuesListCtrl)
      .controller('IssuesEditCtrl', IssuesEditCtrl);

import attachIssue from './directives/attachIssue.js';

module.directive('attachIssue', attachIssue);

import IssuesSrc from './services/IssuesSrc.js';

module.service('IssuesSrc', IssuesSrc);

// config
module.config(function ($stateProvider, basePermissionsSetProvider) {
  $stateProvider
    .state('issues.list', {
      url: "/issues",
      controller: 'IssuesListCtrl',
      templateUrl: "views/modules/issues/page-list.html",
      data: {
        pageTitle: 'Issues',
        hideTitle: true
      },
      resolve: {
        permissions: basePermissionsSetProvider.access(['issues'])
      }
    })
    .state('issues.create', {
      url: "/issues/new",
      controller: 'IssuesEditCtrl',
      templateUrl: "views/modules/issues/page-edit.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        issue: ($stateParams, $q, IssuesIssueModel) => {
          var defer = $q.defer();
          defer.resolve(new IssuesIssueModel({
            issuePrefix: 'ISS'
          }));
          return defer.promise;
        }
      }
    })
    .state('issues.edit', {
      url: "/issues/:issuePrefix-:issueNumber",
      controller: 'IssuesEditCtrl',
      templateUrl: "views/modules/issues/page-edit.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        issue: ($q, $stateParams, IssuesIssueModel) => {
          var defer = $q.defer();
          IssuesIssueModel.query({ issuePrefix: $stateParams.issuePrefix, issueNumber: $stateParams.issueNumber }, (data) => {
            if (data.length) {
              defer.resolve(data[0]);
            } else {
              defer.reject({ error: 404 });
            }
          }, () => {
            defer.reject({ error: 404 });
          });
          return defer.promise;
        }
      }
    });
});

export default appName;