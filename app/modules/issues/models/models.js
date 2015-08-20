var appName = 'module.issues.models';

var module = angular.module(appName, [
  'ngResource',
  'ngEditableTree'
]);

// models
import IssuesIssueModel from './IssuesIssueModel.js';
import IssuesTypeModel from './IssuesTypeModel.js';

module.factory('IssuesIssueModel', IssuesIssueModel)
  .factory('IssuesTypeModel', IssuesTypeModel);

export default appName;