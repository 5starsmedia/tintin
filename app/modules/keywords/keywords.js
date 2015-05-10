import projects from './projects/projects';
import textUnique from './text-unique/text-unique';

var appName = 'module.keywords';

var module = angular.module(appName, [
  projects,
  textUnique
]);

export default appName;