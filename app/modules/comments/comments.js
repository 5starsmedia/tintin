import comments from './comments/comments';

var appName = 'module.comments';

var module = angular.module(appName, [
  comments
]);

export default appName;