var appName = 'module.news.post';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.bootstrap.popover',
  'ui.router',
  'satellizer',
  'ngTable',
  'ngCkeditor',
  'ui.select',
  'ngSanitize',
  'sticky',
  models
]);

// controllers
import NewsPostsCtrl from './controllers/NewsPostsCtrl.js';
import NewsPostsEditCtrl from './controllers/NewsPostsEditCtrl.js';

module.controller('NewsPostsCtrl', NewsPostsCtrl)
  .controller('NewsPostsEditCtrl', NewsPostsEditCtrl);


// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('news', {
      abstract: true,
      templateUrl: "views/common/content_small.html"
    })
    .state('news.posts', {
      url: "/news",
      controller: 'NewsPostsCtrl',
      templateUrl: "views/modules/news/page-posts.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      }
    })
    .state('news.create', {
      url: "/news/new",
      controller: 'NewsPostsEditCtrl',
      templateUrl: "views/modules/news/page-edit.html",
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
    .state('news.edit', {
      url: "/news/:id",
      controller: 'NewsPostsEditCtrl',
      templateUrl: "views/modules/news/page-edit.html",
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
    })
});

export default appName;