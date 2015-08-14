var appName = 'module.sites.domain';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'satellizer',
  'ngTable',
  'ngCkeditor',
  'ui.select',
  'ngSanitize',
  'sticky',
  models
]);

// controllers
import SitesDomainsCtrl from './controllers/SitesDomainsCtrl.js';
import SitesDomainEditCtrl from './controllers/SitesDomainEditCtrl.js';

module.controller('SitesDomainsCtrl', SitesDomainsCtrl)
  .controller('SitesDomainEditCtrl', SitesDomainEditCtrl);


// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('sites', {
      abstract: true,
      parent: 'cabinet',
      template: '<div ui-view></div>'
    })
    .state('sites.domains', {
      url: "/domains",
      controller: 'SitesDomainsCtrl',
      templateUrl: "views/modules/sites/page-domains.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      }
    })
    .state('sites.create', {
      url: "/domains/new",
      controller: 'SitesDomainEditCtrl',
      templateUrl: "views/modules/sites/page-edit.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        site: ($stateParams, $q, SiteDomainModel) => {
          var defer = $q.defer();
          defer.resolve(new SiteDomainModel({
          }));
          return defer.promise;
        }
      }
    })
    .state('sites.edit', {
      url: "/domains/:id",
      controller: 'SitesDomainEditCtrl',
      templateUrl: "views/modules/sites/page-edit.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        site: function($stateParams, SiteDomainModel) {
          return SiteDomainModel.get({ _id: $stateParams.id }).$promise;
        }
      }
    });
});

export default appName;