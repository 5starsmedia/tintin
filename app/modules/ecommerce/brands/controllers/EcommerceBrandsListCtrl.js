define([
    'modules/ecommerce/brands/module'
], function (module) {
    'use strict';

    module.controller('EcommerceBrandsListCtrl', ['$scope', 'EcommerceBrandModel', 'ngTableParams',
        function ($scope, EcommerceBrandModel, ngTableParams) {

            $scope.loading = true;

            $scope.tableParams = new ngTableParams({
                page: 1,            // show first page
                count: 10           // count per page
            }, {
                getData: function($defer, params) {

                    $scope.loading = true;
                    EcommerceBrandModel.get(params.url(), function (res) {
                        var data = [];
                        angular.forEach(res.data, function(item) {
                            data.push(new EcommerceBrandModel(item));
                        });
                        $scope.loading = false;
                        params.total(res.pager.total);
                        $defer.resolve(data);
                    }, function() {
                        $scope.loading = false;
                    });

                }
            });

            $scope.filterByCategory = function(category) {
                $scope.tableParams.filter({category_id: category.id});
            };

            $scope.remove = function(item) {
                $scope.loading = true;
                item.$remove(function() {
                    $scope.tableParams.reload();
                })
                return false;
            };
        }]);

});