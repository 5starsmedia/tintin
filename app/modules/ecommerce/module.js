define([
    'angular',

    'modules/ecommerce/list/config',
    'modules/ecommerce/currencies/config',
    'modules/ecommerce/edit-product/config',
    'modules/ecommerce/types/config',
    'modules/ecommerce/brands/config',
    'modules/ecommerce/liqpay/config',
    'modules/ecommerce/orders/config',
    'modules/ecommerce/categories/config'
], function (angular) {
    'use strict';

    return angular.module('module.ecommerce', [
        'module.ecommerce.list',
        'module.ecommerce.currencies',
        'module.ecommerce.edit-product',
        'module.ecommerce.types',
        'module.ecommerce.brands',
        'module.ecommerce.liqpay',
        'module.ecommerce.orders',
        'module.ecommerce.categories'
    ]);
});