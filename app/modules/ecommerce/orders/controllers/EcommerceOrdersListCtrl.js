define([
    'modules/ecommerce/orders/module'
], function (module) {
    'use strict';

    module.controller('EcommerceOrdersListCtrl', ['$scope', 'EcommerceOrderModel', 'ngTableParams', '$modal', 'bzConfig', '$q', 'orderStatuses',
        function ($scope, EcommerceOrderModel, ngTableParams, $modal, bzConfig, $q, orderStatuses) {

            $scope.loading = true;

            $scope.tableParams = new ngTableParams({
                page: 1,            // show first page
                count: 10           // count per page
            }, {
                getData: function($defer, params) {

                    $scope.loading = true;
                    EcommerceOrderModel.get(params.url(), function (res) {
                        var data = [];
                        angular.forEach(res.data, function(item) {
                            data.push(new EcommerceOrderModel(item));
                        });
                        $scope.loading = false;
                        params.total(res.pager.total);
                        $defer.resolve(data);
                    }, function() {
                        $scope.loading = false;
                    });

                }
            });

            $scope.showDetails = function (item) {
                var modalInstance = $modal.open({
                    templateUrl: bzConfig.templateUrl('/modules/ecommerce/orders/form-order.html')(),
                    controller: 'EcommerceOrdersDetailsCtrl',
                    resolve: {
                        item: function () {
                            return item;
                        }
                    }
                });
                modalInstance.result.then(function() {
                    $scope.tableParams.reload();
                });
            };

            $scope.getStatuses = function() {
                var defer = $q.defer();
                defer.resolve(angular.copy(orderStatuses));
                return defer;
            };

            $scope.remove = function(item) {
                $scope.loading = true;
                item.$remove(function() {
                    $scope.tableParams.reload();
                });
                return false;
            };
        }]);

});