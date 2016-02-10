export default
class fbComponentsCtrl {
    /*@ngInject*/
    constructor($scope, fbBuilderPvd, SiteSectionModel, $templateCache) {
        $scope.sortableOptions = {
            sort: false,
            group: {
                name: 'components',
                pull: 'clone',
                put: false
            },
            fallbackOnBody: true,
            forceFallback: true,
            animation: 150
        };

        $scope.selectGroup = function ($event, group) {
            if ($event != null) {
                $event.preventDefault();
            }
            $scope.activeGroup = group;
            $scope.components = [];
            var results = [];
            for (var name in fbBuilderPvd.components) {
                var component = fbBuilderPvd.components[name];
                if (component.group === group) {
                    results.push($scope.components.push(component));
                }
            }
            return results;
        };



        $scope.groups = fbBuilderPvd.groups;
        $scope.activeGroup = $scope.groups[0];
        $scope.allComponents = fbBuilderPvd.components;
        $scope.$watch('allComponents', function () {
            $scope.selectGroup(null, $scope.activeGroup);
        });
    }
}