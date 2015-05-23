import projects from './projects/projects';
import textUnique from './text-unique/text-unique';
import seo from './seo/seo';

var appName = 'module.keywords';

var module = angular.module(appName, [
  projects,
  textUnique,
  seo
]);

export default appName;