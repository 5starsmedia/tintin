'use strict';

var appName = 'base';

import BaseAPIParams from './factories/BaseAPIParams.js';

import translate from './filters/translate.js';

angular.module(appName, [])
  .constant('appTitle', 'TinTin CMS')
  .constant('appSite', '5starsmedia.com.ua')
  .constant('appSiteLink', 'https://5starsmedia.com.ua/')
  .constant('BaseAPIParams', BaseAPIParams)
  .filter('translate', translate)

  .run(($rootScope, appTitle, appSite, appSiteLink) => {
    $rootScope.appTitle = appTitle;
    $rootScope.appSite = appSite;
    $rootScope.appSiteLink = appSiteLink;
  });

export default appName;