'use strict';

var appName = 'base';

import BaseAPIParams from './factories/BaseAPIParams.js';

import translate from './filters/translate.js';
import trim from './filters/trim.js';

// directives
import baseMetaEdit from './directives/baseMetaEdit.js';

angular.module(appName, [])
  .constant('appTitle', 'Paphos CMS')
  .constant('appSite', '5starsmedia.com.ua')
  .constant('appSiteLink', 'https://5starsmedia.com.ua/')
  .constant('BaseAPIParams', BaseAPIParams)
  .filter('translate', translate)
  .filter('trim', trim)

  .run(($rootScope, appTitle, appSite, appSiteLink) => {
    $rootScope.appTitle = appTitle;
    $rootScope.appSite = appSite;
    $rootScope.appSiteLink = appSiteLink;
  })


  .directive('baseMetaEdit', baseMetaEdit);


export default appName;