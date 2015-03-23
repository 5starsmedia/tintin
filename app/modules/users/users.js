import profile from './profile/profile';

var appName = 'module.users';

var module = angular.module(appName, [
  profile
]);

export default appName;