import profile from './profile/profile';
import users from './users/users';

var appName = 'module.users';

var module = angular.module(appName, [
  profile,
  users
]);

export default appName;