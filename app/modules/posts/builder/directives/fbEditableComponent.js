export default
/*@ngInject*/
($compile, $rootScope, $timeout, fbBuilderPvd) => {
  return {
    restrict: 'A',
    scope: {
      object: '=fbEditableComponent'
    },
    template: '<div fb-component="component"></div>',
    link: function (scope, element) {
      var onChange = (name) => {
        if (!name) {
          return;
        }
        var component = angular.copy(fbBuilderPvd.components[name]);
        if (!component) {
          return;
        }
        component.object = scope.object;
        component.settings = angular.extend(component.defaults, scope.object.settings);
        scope.component = component;

        if (scope.object.select) {
          $timeout(() => {
            $rootScope.$broadcast('fbChangeActive', component);
          }, 10);
          delete scope.object.select;
        }
      };

      scope.$watch('object.component', onChange);

      scope.$watch('component.settings', settings => {
        if (!settings) {
          return;
        }
        scope.object.settings = settings;
      }, true);
    }
  };
}