export default
  /*@ngInject*/
  function (SiteDomainModel) {
    return {
      require: '^stForm',
      restrict: 'E',
      replace: true,
      scope: {
        'value': '=ngModel',
        'name': '@',
        'showExternal': '@',
        'prefix': '@'
      },
      templateUrl: 'app/theme/directives/stUrlInput/stUrlInput.html',
      link: function (scope, element, attrs, stForm) {
        SiteDomainModel.getCurrent((site) => {
          scope.site = site;

          scope.urlPrefix = site.getUrl() + (scope.prefix ? scope.prefix : '/');
        });
        console.info(scope.prefix)
      }
    };
}