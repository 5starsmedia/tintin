define([
    'angular',

    'bz',

    'modules/ecommerce/models/config'
], function (angular) {
    'use strict';

    return angular.module('module.ecommerce.categories', [
        'bz',

        'module.ecommerce.models'
    ]);
});