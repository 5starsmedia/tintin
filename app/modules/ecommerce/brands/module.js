define([
    'angular',

    'bz', 'ngTable',

    'modules/ecommerce/models/config'
], function (angular) {
    'use strict';

    return angular.module('module.ecommerce.brands', [
        'bz',

        'module.ecommerce.models',

        'ngTable'
    ]);
});