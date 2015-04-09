define([
    'modules/ecommerce/orders/module',

    'modules/ecommerce/orders/controllers/EcommerceOrdersDetailsCtrl',
    'modules/ecommerce/orders/controllers/EcommerceOrdersListCtrl'
], function (module) {
    'use strict';

    module.value('orderStatuses', []);

    module.config(['$routeSegmentProvider', 'bzConfigProvider', 'bzUserProvider',
        function($routeSegmentProvider, bzConfigProvider, bzUserProvider) {

            $routeSegmentProvider
                .when('/ecommerce/orders', 'EcommerceOrdersList')
                .segment('EcommerceOrdersList', {
                    templateUrl: bzConfigProvider.templateUrl('/modules/ecommerce/orders/page-list.html'),
                    resolve: {
                        permissions: bzUserProvider.access(['ecommerce.can_manage_products'])
                    },
                    controller: 'EcommerceOrdersListCtrl',
                    resolveFailed: bzConfigProvider.errorResolver()
                });

    }]);

    module.run(['orderStatuses', function(orderStatuses) {
        var el = angular.element(document.getElementById('ecommerceOrdersMenu'));

        orderStatuses.push({ 'id': 0, 'title': 'новый', 'class': 'default' });
        orderStatuses.push({ 'id': 1, 'title': 'оплачен', 'class': 'info' });
        orderStatuses.push({ 'id': 2, 'title': 'товар ожидает клиента', 'class': 'info' });
        orderStatuses.push({ 'id': 3, 'title': 'заказ доставляется', 'class': 'info' });
        orderStatuses.push({ 'id': 4, 'title': 'ожидание товара', 'class': 'warning' });
        orderStatuses.push({ 'id': 5, 'title': 'отменен', 'class': 'danger' });
        orderStatuses.push({ 'id': 6, 'title': 'доставлен', 'class': 'success' });
    }]);

    return module;

});