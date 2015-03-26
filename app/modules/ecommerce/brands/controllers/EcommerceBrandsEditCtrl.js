define([
    'modules/ecommerce/brands/module'
], function (module) {
    'use strict';

    module.controller('EcommerceBrandsEditCtrl', ['$scope', 'item', '$location',
        function ($scope, item, $location) {
            $scope.item = item;

            $scope.saveItem = function(item) {
                $scope.loading = true;
                item.$save(function() {
                    $scope.loading = false;

                    $location.path('/ecommerce/brands');
                });
            };

        }]);

});