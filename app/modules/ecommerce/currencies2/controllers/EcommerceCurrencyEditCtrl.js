define([
    'modules/ecommerce/currencies/module'
], function (module) {
    'use strict';

    module.controller('EcommerceCurrencyEditCtrl', ['$scope', '$modalInstance', 'item',
        function ($scope, $modalInstance, item) {
            $scope.item = item;

            $scope.saveItem = function () {
                $scope.loading = true;
                item.$save(function () {
                    $scope.loading = false;
                    $modalInstance.close(item);
                });
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }]);

});