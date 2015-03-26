define([
    'modules/ecommerce/categories/module'
], function (module) {
    'use strict';

    module.controller('EcommerceCategoriesCtrl', ['$scope', '$rootScope', '$filter', '$routeSegment', 'EcommerceCategoryModel',
        function ($scope, $rootScope, $filter, $routeSegment, categoriesFactory) {

            $scope.loading = true;
            categoriesFactory.getTree(function (res) {
                $scope.loading = false;

                var parents = [];
                // get categories
                $scope.category = res;

                // select active category
                $scope.activeCategory = categoriesFactory.find(res, function (item) {
                    return item.id == $routeSegment.$routeParams.category_id;
                }, parents);

                // open all nodes to active category
                if ($scope.activeCategory) {
                    angular.forEach(parents, function (node) {
                        node.$expanded = true;
                    });
                }
            });

            $scope.addCategory = function (child) {
                $scope.loading = true;
                child.$insertItem(function (item) {
                    $scope.loading = false;
                    item.focus = true;
                    item.$settings = true;
                });
            };

            $scope.move = function (item, before, index) {
                $scope.loading = true;
                item.$moveItem(before, index, function() {
                    $scope.loading = false;
                });
            };

            $scope.saveCategory = function (item) {
                var category = new categoriesFactory(item);
                item.$loading = true;
                category.$save(function (data) {
                    item.$loading = false;
                    item.url = data.url;
                    item.$settings = false;
                });
            };

            $scope.remove = function (child) {
                function walk(target) {
                    var children = target.children,
                        i;
                    if (children) {
                        i = children.length;
                        while (i--) {
                            if (children[i].id == child.id) {
                                return children.splice(i, 1);
                            } else {
                                walk(children[i]);
                            }
                        }
                    }
                }

                $scope.loading = true;
                categoriesFactory.$delete({ 'id': child.id }, function () {
                    $scope.loading = false;
                    walk($scope.category);
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
            };
        }]);

});