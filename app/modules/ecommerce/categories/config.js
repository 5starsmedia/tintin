define([
    'modules/ecommerce/categories/module',

    'modules/ecommerce/categories/controllers/EcommerceCategoriesCtrl'
], function (module) {
    'use strict';

    module.config(['$routeSegmentProvider', 'bzConfigProvider', 'bzUserProvider',
        function($routeSegmentProvider, bzConfigProvider, bzUserProvider) {
            $routeSegmentProvider
                .when('/ecommerce/categories', 'EcommerceCategories')
                .segment('EcommerceCategories', {
                    templateUrl: bzConfigProvider.templateUrl('/modules/ecommerce/page-categories.html'),
                    resolve: {
                        permissions: bzUserProvider.access(['ecommerce.can_manage_products'])
                    },
                    controller: 'EcommerceCategoriesCtrl',
                    resolveFailed: bzConfigProvider.errorResolver()
                });
    }]);
    return module;

});