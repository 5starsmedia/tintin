var appName = 'module.sites.settings';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'sticky',
  models
]);

// controllers
import SitesSettingsCtrl from './controllers/SitesSettingsCtrl.js';

module.controller('SitesSettingsCtrl', SitesSettingsCtrl);


// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('sites.settings', {
      url: "/site-settings",
      controller: 'SitesSettingsCtrl',
      templateUrl: "views/modules/sites/page-settings.html",
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