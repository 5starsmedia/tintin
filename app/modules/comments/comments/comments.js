var appName = 'module.comments.comments';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'satellizer',
  'ngTable',
  'ui.select',
  'ngSanitize',
  models
]);

// controllers
import CommentsCommentsCtrl from './controllers/CommentsCommentsCtrl.js';

module.controller('CommentsCommentsCtrl', CommentsCommentsCtrl);


// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('comments', {
      abstract: true,
      templateUrl: "views/common/content_small.html"
    })
    .state('comments.comments', {
      url: "/comments",
      controller: 'CommentsCommentsCtrl',
      templateUrl: "views/modules/comments/page-comments.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      }
    });
});

export default appName;