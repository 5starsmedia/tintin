define([
    'modules/ecommerce/brands/module',

    'modules/ecommerce/brands/controllers/EcommerceBrandsEditCtrl',
    'modules/ecommerce/brands/controllers/EcommerceBrandsListCtrl'
], function (module) {
    'use strict';

    module.config(['$routeSegmentProvider', 'bzConfigProvider', 'bzUserProvider',
        function($routeSegmentProvider, bzConfigProvider, bzUserProvider) {
            $routeSegmentProvider
                .when('/ecommerce/brands', 'EcommerceBrandsList')
                .segment('EcommerceBrandsList', {
                    templateUrl: bzConfigProvider.templateUrl('/modules/ecommerce/brands/page-list.html'),
                    resolve: {
                        permissions: bzUserProvider.access(['ecommerce.can_manage_products'])
                    },
                    controller: 'EcommerceBrandsListCtrl',
                    resolveFailed: bzConfigProvider.errorResolver()
                });
            $routeSegmentProvider
                .when('/ecommerce/brands/new', 'EcommerceBrandsNew')
                .segment('EcommerceBrandsNew', {
                    templateUrl: bzConfigProvider.templateUrl('/modules/ecommerce/brands/page-edit.html'),
                    resolve: {
                        permissions: bzUserProvider.access(['ecommerce.can_manage_products']),
                        item: ['EcommerceBrandModel', '$q', function(EcommerceBrandModel, $q) {
                            var defer = $q.defer();
                            defer.resolve(new EcommerceBrandModel({}));
                            return defer.promise;
                        }]
                    },
                    controller: 'EcommerceBrandsEditCtrl',
                    resolveFailed: bzConfigProvider.errorResolver()
                });
            $routeSegmentProvider
                .when('/ecommerce/brands/edit/:id', 'EcommerceBrandsEdit')
                .segment('EcommerceBrandsEdit', {
                    templateUrl: bzConfigProvider.templateUrl('/modules/ecommerce/brands/page-edit.html'),
                    resolve: {
                        permissions: bzUserProvider.access(['ecommerce.can_manage_products']),
                        item: ['EcommerceBrandModel', '$routeParams', function(EcommerceBrandModel, $routeParams) {
                            return EcommerceBrandModel.get({ id: $routeParams.id }).$promise;
                        }]
                    },
                    controller: 'EcommerceBrandsEditCtrl',
                    resolveFailed: bzConfigProvider.errorResolver()
                });
    }]);
    return module;

});