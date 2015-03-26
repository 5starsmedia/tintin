define([
    'angular',

    'bz', 'ngTable',

    'modules/ecommerce/models/config'
], function (angular) {
    'use strict';

    return angular.module('module.ecommerce.types', [
        'bz',

        'ngTable',

        'module.ecommerce.models'
    ]);
});