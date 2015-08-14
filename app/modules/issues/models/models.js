var appName = 'module.issues.models';

var module = angular.module(appName, [
  'ngResource',
  'ngEditableTree'
]);

// models
import IssuesIssueModel from './IssuesIssueModel.js';

module.factory('IssuesIssueModel', IssuesIssueModel);

export default appName;