define([
    'modules/ecommerce/types/module',

    'modules/ecommerce/types/controllers/EcommerceEditFieldCtrl',
    'modules/ecommerce/types/controllers/EcommerceEditTypeCtrl',
    'modules/ecommerce/types/controllers/EcommerceTypesCtrl'
], function (module) {
    'use strict';

    module.config(['$routeSegmentProvider', 'bzConfigProvider', 'bzUserProvider',
        function($routeSegmentProvider, bzConfigProvider, bzUserProvider) {
            $routeSegmentProvider
                .when('/ecommerce/types', 'EcommerceTypes')
                .segment('EcommerceTypes', {
                    templateUrl: bzConfigProvider.templateUrl('/modules/ecommerce/page-types.html'),
                    resolve: {
                        permissions: bzUserProvider.access(['ecommerce.can_manage_products'])
                    },
                    controller: 'EcommerceTypesCtrl',
                    resolveFailed: bzConfigProvider.errorResolver()
                });
    }]);
    return module;

});