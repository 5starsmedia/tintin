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

import commentsForResource from './directives/commentsForResource.js';
import commentsBox from './directives/commentsBox.js';
import commentsSend from './directives/commentsSend.js';

module.directive('commentsForResource', commentsForResource);
module.directive('commentsBox', commentsBox);
module.directive('commentsSend', commentsSend);

// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('comments', {
      abstract: true,
      parent: 'cabinet',
      template: '<div ui-view></div>'
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