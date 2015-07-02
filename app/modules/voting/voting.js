import polls from './polls/polls';

var appName = 'module.voting';

var module = angular.module(appName, [
  polls
]);

export default appName;