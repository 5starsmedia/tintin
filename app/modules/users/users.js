import profile from './profile/profile';
import users from './users/users';
import roles from './roles/roles';
import permissions from './permissions/permissions';

var appName = 'module.users';

var module = angular.module(appName, [
  profile,
  users,
  roles,
  permissions
]);

export default appName;