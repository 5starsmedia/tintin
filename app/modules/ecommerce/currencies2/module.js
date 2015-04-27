define([
    'angular',

    'bz', 'ngTable',

    'modules/ecommerce/models/config'
], function (angular) {
    'use strict';

    return angular.module('module.ecommerce.currencies', [
        'bz',

        'module.ecommerce.models',

        'ngTable'
    ]);
});