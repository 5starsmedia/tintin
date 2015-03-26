define([
    'modules/ecommerce/types/module'
], function (module) {
    'use strict';

    module.controller('EcommerceEditFieldCtrl', ['$scope', 'item', '$modalInstance', '$filter',
        function ($scope, item, $modalInstance, $filter) {

            $scope.item = item;

            $scope.fieldTypes = [
                { id: 1, title: $filter('translate')('Чекбокс (Да/Нет)')      },
                { id: 2, title: $filter('translate')('Текст')    },
                { id: 3, title: $filter('translate')('Число')    },
                { id: 4, title: $filter('translate')('Выпадающий список')       },
                { id: 5, title: $filter('translate')('Список чекбоксов')   },
                { id: 6, title: $filter('translate')('Разделитель') }
            ];

            $scope.saveItem = function () {
                $scope.loading = true;
                item.$save(function () {
                    $scope.loading = false;
                    $modalInstance.close(item);
                });
            };

            $scope.close = function () {
                $modalInstance.dismiss('cancel');
            };

            $scope.addVariant = function(item) {
                var max = 0;
                if (!angular.isObject(item.data)) {
                    item.data = {};
                }
                angular.forEach(item.data, function(itm, n) {
                    n = parseInt(n);
                    if (angular.isNumber(n) && n > max) {
                        max = n;
                    }
                });
                item.data[max + 1] = {};
            }
            $scope.removeVariant = function(item, i) {
                delete item.data[i];
            }
        }]);

});