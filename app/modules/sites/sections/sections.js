var appName = 'module.sites.sections';

import models from '../models/models.js';

let module = angular.module(appName, [
    'base',
    'ui.router',
    'sticky',
    models
]);

// controllers
import SitesSectionsCtrl from './controllers/SitesSectionsCtrl.js';
import SitesSectionEditCtrl from './controllers/SitesSectionEditCtrl.js';

module
    .controller('SitesSectionsCtrl', SitesSectionsCtrl)
    .controller('SitesSectionEditCtrl', SitesSectionEditCtrl)
;


// config
module.config(function ($stateProvider) {
    $stateProvider
        .state('sites.sections', {
            url: "/sections",
            controller: 'SitesSectionsCtrl',
            templateUrl: "views/modules/sites/page-sections.html"
        })
        .state('sites.sectionsCreate', {
            url: "/sections/new",
            controller: 'SitesSectionEditCtrl',
            templateUrl: "views/modules/sites/page-section-edit.html",
            resolve: {
                item: ($stateParams, $q, SiteSectionModel) => {
                    var defer = $q.defer();
                    defer.resolve(new SiteSectionModel({
                    }));
                    return defer.promise;
                }
            }
        })
        .state('sites.sectionsEdit', {
            url: "/sections/:id",
            controller: 'SitesSectionEditCtrl',
            templateUrl: "views/modules/sites/page-section-edit.html",
            resolve: {
                item: function($stateParams, SiteSectionModel) {
                    return SiteSectionModel.get({ _id: $stateParams.id }).$promise;
                }
            }
        });
});


export default appName;