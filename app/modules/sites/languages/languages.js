var appName = 'module.sites.languages';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'sticky',
  models
]);

// controllers
import SitesLanguagesCtrl from './controllers/SitesLanguagesCtrl.js';

module.controller('SitesLanguagesCtrl', SitesLanguagesCtrl);


// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('sites.languages', {
      url: "/site-languages",
      controller: 'SitesLanguagesCtrl',
      templateUrl: "views/modules/sites/page-languages.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        site: function($stateParams, SiteDomainModel) {
          return SiteDomainModel.getCurrent().$promise;
        }
      }
    });
});

export default appName;