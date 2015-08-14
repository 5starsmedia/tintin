var appName = 'module.comments.models';

var module = angular.module(appName, [
  'ngResource'
]);

// models
import CommentsCommentModel from './CommentsCommentModel.js';

module.factory('CommentsCommentModel', CommentsCommentModel);

export default appName;