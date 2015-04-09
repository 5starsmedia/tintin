define([
    'modules/ecommerce/currencies/module'
], function (module) {
    'use strict';

    module.controller('EcommerceCurrenciesCtrl', ['$scope', 'EcommerceCurrencyModel', 'ngTableParams', '$modal', 'bzConfig',
        function ($scope, CurrencyModel, ngTableParams, $modal, bzConfig) {
            $scope.isEdit = false;

            $scope.tableParams = new ngTableParams({
                page: 1,            // show first page
                count: 10,          // count per page
                sorting: {
                    name: 'asc'     // initial sorting
                }
            }, {
                total: 0,           // length of data
                getData: function ($defer, params) {
                    $scope.loading = true;
                    // ajax request to api
                    CurrencyModel.get(params.url(), function (data) {
                        $scope.loading = false;

                        params.total(data.total);
                        // set new data
                        $defer.resolve(data.data);
                    });
                }
            });

            $scope.editItem = function (item) {
                item = item || {};
                var modalInstance = $modal.open({
                    templateUrl: bzConfig.templateUrl('/modules/ecommerce/form-currency.html')(),
                    controller: 'EcommerceCurrencyEditCtrl',
                    resolve: {
                        item: function () {
                            return new CurrencyModel(item);
                        }
                    }
                });
                modalInstance.result.then(function() {
                    $scope.tableParams.reload();
                });
            };

            $scope.setMain = function (item) {
                item = new CurrencyModel(item);
                item.$setMain();
            };

            $scope.deleteItem = function (item) {
                item = new CurrencyModel(item);
                if (confirm('Вы действительно хотите удалить эту валюту?')) {
                    item.$delete(function () {
                        $scope.tableParams.reload();
                    })
                }
            }
        }]);

});