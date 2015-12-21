import profile from './profile/profile';
import users from './users/users';
import clients from './clients/clients';
import roles from './roles/roles';
import permissions from './permissions/permissions';

var appName = 'module.users';

var module = angular.module(appName, [
  profile,
  users,
  roles,
  permissions,
  clients
]);

export default appName;