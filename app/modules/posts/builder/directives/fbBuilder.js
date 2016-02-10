export default
/*@ngInject*/
($rootScope) => {
    return {
        restrict: 'A',
        scope: {
            formObjects: '=fbBuilder'
        },
        template: '<div class="form-horizontal">' +
            '<div ng-sortable="sortableOptions" class="fb-builder">' +
                '<div ng-repeat="component in formObjects" fb-editable-component="component" editable="true"></div>' +
            '</div>' +
        '</div>',
        controller: ($scope) => {
            $scope.sortableOptions = {
                sort: true,
                group: {
                    name: 'components',
                    pull: true,
                    put: true
                },
                fallbackOnBody: true,
                forceFallback: true,
                animation: 150,
                onAdd: (e) => {
                    var newItem = {
                        component: e.model.name,
                        settings: {},
                        select: true
                    };
                    $scope.formObjects.splice(e.newIndex, 1, newItem);
                }
            };
        },
        link: function (scope, element, attrs) {

        }
    };
}