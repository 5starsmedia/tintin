import comments from './comments/comments';
import section from './section/section';

var appName = 'module.comments';

var module = angular.module(appName, [
  comments,
  section
]);

export default appName;