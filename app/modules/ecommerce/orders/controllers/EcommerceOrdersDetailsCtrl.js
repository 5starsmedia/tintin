define([
    'modules/ecommerce/orders/module', 'angular'
], function (module, angular) {
    'use strict';

    module.controller('EcommerceOrdersDetailsCtrl', ['$scope', 'item', '$modalInstance', 'orderStatuses', 'EcommerceOrderModel', '$filter',
        function ($scope, item, $modalInstance, orderStatuses, EcommerceOrderModel, $filter) {
            $scope.item = item;
            $scope.orderStatuses = orderStatuses;

            $scope.cart_loading = true;
            $scope.products = [];
            $scope.groups = {};

            EcommerceOrderModel.get({ id: item.id }, function(order) {
                $scope.cart_loading = false;

                angular.forEach(order.products, function(product) {
                    if (product.group_id == 0) {
                        $scope.products.push(product);
                    } else {
                        if (!angular.isArray($scope.groups[product.group_id])) {
                            $scope.groups[product.group_id] = [];
                        }
                        $scope.groups[product.group_id].push(product);
                    }
                });
            });

            $scope.close = function () {
                $modalInstance.close(item);
            };

            $scope.cancel = function () {
                $scope.loading = true;

                item.$cancel(function() {
                    $scope.loading = false;

                    $scope.notify($filter('translate')('Статус заказа изменен на "Отменен"'), 'success');
                    $modalInstance.dismiss('cancel');
                });
            };
            $scope.complete = function () {
                $scope.loading = true;

                item.status = 6;
                item.$save(function() {
                    $scope.loading = false;

                    $scope.notify($filter('translate')('Статус заказа изменен на "Доставлен"'), 'success');
                    $modalInstance.close(item);
                });
            };
            $scope.changeStatus = function (status) {
                $scope.loading = true;

                item.status = status.id;
                item.$save(function() {
                    $scope.loading = false;

                    $scope.notify($filter('translate')('Статус заказа изменен на "%s"').replace('%s', status.title), 'success');
                });
            };
        }]);

});