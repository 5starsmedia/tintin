export default
/*@ngInject*/
($compile, $rootScope) => {
    return {
        restrict: 'A',
        scope: {
            component: '=fbComponentSettings'
        },
        templateUrl: 'views/forms/block-component-settings.html',
        link: function (scope, element) {
            var settings;

            scope.$watch('component', component => {
                if (!component) {
                    return;
                }
                settings = angular.copy(component.settings);
            })

            scope.remove = () => {
                scope.$emit('fbRemoveComponent', scope.component);
                $rootScope.$broadcast('fbChangeActive', null);
            }
            scope.save = () => {
                scope.$emit('fbSaveSettings', scope.component);
                $rootScope.$broadcast('fbChangeActive', null);
            }
            scope.cancel = () => {
                angular.copy(settings, scope.component.settings);
                scope.$emit('fbHideSettings', scope.component);
                $rootScope.$broadcast('fbChangeActive', null);
            }
        }
    };
}