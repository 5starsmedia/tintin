import groups from './groups/groups';
import textUnique from './text-unique/text-unique';
import seo from './seo/seo';
import specifications from './specifications/specifications';
import assignments from './assignments/assignments';

var appName = 'module.keywords';

var module = angular.module(appName, [
  groups,
  textUnique,
  seo,
  specifications,
  assignments
]);

export default appName;