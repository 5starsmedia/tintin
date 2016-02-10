export default
class fbComponentsCtrl {
    /*@ngInject*/
    constructor($scope, fbBuilderPvd, SiteSectionModel, $templateCache) {

        SiteSectionModel.query(data => {
            fbBuilderPvd.components = {};

            _.each(data, section => {
                $templateCache.put('section' + section._id, section.htmlCode);
                fbBuilderPvd
                    .registerComponent('section' + section._id, {
                        group: 'Default',
                        label: section.title,
                        defaults: {
                            title: 'Text Input',
                            body: '<b>Some</b> <i>cool</i> text'
                        },
                        templateUrl: 'section' + section._id,
                        settingsTemplateUrl: 'views/sections/text-settings.html'
                    });
            });


            $scope.groups = fbBuilderPvd.groups;
            $scope.activeGroup = $scope.groups[0];
            $scope.allComponents = fbBuilderPvd.components;
            $scope.$watch('allComponents', function () {
                $scope.selectGroup(null, $scope.activeGroup);
            });
        });

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

    }
}