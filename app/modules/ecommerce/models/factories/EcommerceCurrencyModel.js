define([
    'modules/ecommerce/models/module'
], function (module) {
    'use strict';

    module.factory('EcommerceCurrencyModel', ['$resource', 'bzConfig',
        function ($resource, bzConfig) {
            var model = new $resource(bzConfig.resource('/currencies/:id'), {'id': '@id'}, {
                '$delete': { method: 'DELETE'},
                'setMain': { method: 'POST', params: { action: 'setMain' } }
            });
            return model;
        }]);

});