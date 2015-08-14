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

// config
module.config(function ($stateProvider, basePermissionsSetProvider) {
  $stateProvider
    .state('issues', {
      abstract: true,
      parent: 'cabinet',
      template: '<div ui-view></div>'
    })
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
        post: ($stateParams, $q, NewsPostModel) => {
          var defer = $q.defer();
          var date = new Date();
          date.setHours(date.getHours() + (date.getMinutes() < 50 ? 1 : 2));
          date.setMinutes(0);
          date.setSeconds(0);

          defer.resolve(new NewsPostModel({
            isAllowComments: true,
            //own_photo: false,
            //user_id: bzUser.id,
            status: 4,
            //publish_date: date
          }));
          return defer.promise;
        }
      }
    })
    .state('issues.edit', {
      url: "/issues/:id",
      controller: 'IssuesEditCtrl',
      templateUrl: "views/modules/issues/page-edit.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        post: function($stateParams, NewsPostModel) {
          return NewsPostModel.get({ _id: $stateParams.id }).$promise;
        }
      }
    });
});

export default appName;