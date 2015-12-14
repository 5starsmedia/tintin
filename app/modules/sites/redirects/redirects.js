var appName = 'module.sites.redirects';

import models from '../models/models.js';

let module = angular.module(appName, [
    'base',
    'ui.router',
    'sticky',
    models
]);

// controllers
import SitesRedirectsCtrl from './controllers/SitesRedirectsCtrl.js';
import SitesRedirectEditCtrl from './controllers/SitesRedirectEditCtrl.js';

module
    .controller('SitesRedirectsCtrl', SitesRedirectsCtrl)
    .controller('SitesRedirectEditCtrl', SitesRedirectEditCtrl)
;


// config
module.config(function ($stateProvider) {
    $stateProvider
        .state('sites.redirects', {
            url: "/redirects",
            controller: 'SitesRedirectsCtrl',
            templateUrl: "views/modules/sites/page-redirects.html"
        })
        .state('sites.redirectsCreate', {
            url: "/redirects/new",
            controller: 'SitesRedirectEditCtrl',
            templateUrl: "views/modules/sites/page-redirect-edit.html",
            resolve: {
                item: ($stateParams, $q, SiteRedirectModel) => {
                    var defer = $q.defer();
                    defer.resolve(new SiteRedirectModel({
                        code: 301
                    }));
                    return defer.promise;
                }
            }
        })
        .state('sites.redirectsEdit', {
            url: "/redirects/:id",
            controller: 'SitesRedirectEditCtrl',
            templateUrl: "views/modules/sites/page-redirect-edit.html",
            resolve: {
                item: function($stateParams, SiteRedirectModel) {
                    return SiteRedirectModel.get({ _id: $stateParams.id }).$promise;
                }
            }
        });
});


export default appName;