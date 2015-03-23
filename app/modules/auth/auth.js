import login from './login/login';

let appName = 'module.auth';

angular.module(appName, [
  login
]);

export default appName;