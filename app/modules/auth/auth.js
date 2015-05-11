import login from './login/login';
import passwordRecovery from './password-recovery/password-recovery';

let appName = 'module.auth';

angular.module(appName, [
  login,
  passwordRecovery
]);

export default appName;