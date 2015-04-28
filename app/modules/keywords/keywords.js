import projects from './projects/projects';
//import groups from './groups/groups';

var appName = 'module.keywords';

var module = angular.module(appName, [
  projects,
  //groups
]);

export default appName;