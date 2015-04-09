define([
    'modules/ecommerce/currencies/module',

    'modules/ecommerce/currencies/controllers/EcommerceCurrenciesCtrl',
    'modules/ecommerce/currencies/controllers/EcommerceCurrencyEditCtrl'
], function (module) {
    'use strict';

    module.config(['$routeSegmentProvider', 'bzConfigProvider', 'bzUserProvider',
        function($routeSegmentProvider, bzConfigProvider, bzUserProvider) {
            $routeSegmentProvider
                .when('/ecommerce/currencies', 'EcommerceCurrencies')
                .segment('EcommerceCurrencies', {
                    templateUrl: bzConfigProvider.templateUrl('/modules/ecommerce/page-currencies.html'),
                    resolve: {
                        permissions: bzUserProvider.access(['ecommerce.can_manage_products'])
                    },
                    controller: 'EcommerceCurrenciesCtrl',
                    resolveFailed: bzConfigProvider.errorResolver()
                });
    }]);
    return module;

});