'use strict';

var appName = 'base';

import BaseAPIParams from './factories/BaseAPIParams.js';

import translate from './filters/translate.js';

angular.module(appName, [
])
  .constant('appTitle', () => 'TinTin CMS')
  .constant('BaseAPIParams', BaseAPIParams)
  .filter('translate', translate);

export default appName;