define([
    'modules/ecommerce/models/module'
], function (module) {
    'use strict';

    module.factory('EcommerceOrderModel', ['$resource', 'bzConfig',
        function ($resource, bzConfig) {
            var model = new $resource(bzConfig.resource('/ecommerce/orders/:id'), {'id': '@id'}, {
                'cancel': { method: 'DELETE' }
            });
            return model;
        }]);

});