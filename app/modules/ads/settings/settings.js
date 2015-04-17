var appName = 'module.ads.settings';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'sticky',
  models
]);

// controllers
import AdsSettingsCtrl from './controllers/AdsSettingsCtrl.js';
module.controller('AdsSettingsCtrl', AdsSettingsCtrl);

import adsHtmlPreview from './directives/adsHtmlPreview.js';
module
  .directive('adsHtmlPreview', adsHtmlPreview);

// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('ads', {
      abstract: true,
      templateUrl: "views/common/content_small.html"
    })
    .state('ads.settings', {
      url: "/ads-settings",
      controller: 'AdsSettingsCtrl',
      templateUrl: "views/modules/ads/page-settings.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      }
    });
});

export default appName;