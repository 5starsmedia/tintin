import base from './base/base.js';
import modules from './modules/modules.config';
import theme from './theme/main.js';

let appName = 'app';

angular.module(appName, [base, theme, 'views'].concat(modules));

export default appName;