export default
/*@ngInject*/
($compile, $rootScope, $http, $templateCache, fbBuilderPvd) => {
  return {
    restrict: 'A',
    scope: {
      component: '=fbComponent',
      editable: '@'
    },
    controller: 'fbComponentCtrl',
    template: '<div><div class="component-name">{{component.label}}</div><div class="component-template" ng-include="component.templateUrl"></div></div>',
    link: function (scope, element) {
      element.on('click', (e) => {
        e.stopPropagation();
        scope.$apply(() => {
          if (scope.editable == 'false') {
            return;
          }
          $rootScope.$broadcast('fbChangeActive', scope.component);
        });
      });

      scope.$on('fbChangeActive', (e, component) => {
        element.toggleClass('fb-selected', component == scope.component);
      });

      scope.$watch('component', component => {
        if (!component) {
          return;
        }
        scope.component.settings = angular.extend(scope.component.defaults, scope.component.settings)
        scope.settings = scope.component.settings;
        scope.settings.sections = scope.settings.sections || [];
        scope.settings.sections2 = scope.settings.sections2 || [];
        scope.settings.sections3 = scope.settings.sections3 || [];
        scope.settings.sections4 = scope.settings.sections4 || [];
      });

      scope.$watch('editable', editable => {
        element.addClass('fb-component');
        element.toggleClass('fb-component-editable', editable);
      });
    }
  };
}