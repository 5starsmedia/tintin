define([
    'modules/ecommerce/types/module'
], function (module) {
    'use strict';

    module.controller('EcommerceEditTypeCtrl', ['$scope', 'EcommerceTypeFieldModel', 'ngTableParams', '$modal', 'bzConfig',
        function ($scope, EcommerceTypeFieldModel, ngTableParams, $modal, bzConfig) {

            $scope.loading = true;


            $scope.editField = function(field) {
                field = angular.copy(field) || new EcommerceTypeFieldModel({ type: 1, order: 0, data: {} });
                field.type_id = $scope.child.id;
                field.type = '' + field.type;

                var modalInstance = $modal.open({
                    templateUrl: bzConfig.templateUrl('/modules/ecommerce/form-field.html')(),
                    controller: 'EcommerceEditFieldCtrl',
                    resolve: {
                        item: function () {
                            return field;
                        }
                    }
                });
                modalInstance.result.then(function (selectedItem) {
                    $scope.tableParams.reload();
                }, function () {
                });
            };

            $scope.tableParams = new ngTableParams({
                page: 1,            // show first page
                count: 100           // count per page
            }, {
                counts: [],
                getData: function($defer, params) {

                    $scope.loading = true;
                    var param = params.url();
                    param.type_id = $scope.child.id;
                    EcommerceTypeFieldModel.get(param, function (res) {
                        var data = [];
                        angular.forEach(res.data, function(item) {
                            data.push(new EcommerceTypeFieldModel(item));
                        });
                        $scope.loading = false;
                        params.total(res.pager.total);
                        $defer.resolve(data);
                    }, function() {
                        $scope.loading = false;
                    });

                }
            });

            $scope.remove = function (field) {
                $scope.loading = true;
                field.$delete({ type_id: $scope.child.id }, function() {
                    $scope.loading = false;
                })
            };

        }]);

});