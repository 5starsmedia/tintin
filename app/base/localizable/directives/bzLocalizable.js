export default
/*@ngInject*/
function bzLocalizable($compile, $rootScope, SiteDomainModel) {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: true,
    link: function (scope, element, attrs) {
      var defaultLocale;

      SiteDomainModel.getCurrent({ fields: 'defaultLocale,allowLocales' }, (data) => {
        defaultLocale = data.defaultLocale;
        $rootScope.$contentLanguage = scope.language = _.find(data.allowLocales, { code: data.defaultLocale });
        scope.languages = data.allowLocales;

        element.parent().toggleClass('input-group', scope.languages.length > 1)
      });

      var languageDiv = angular.element(document.createElement('div')),
        languages = window.config.languages || [];

      if (Object.keys(languages).length <= 1) {
        return;
      }

      element.wrap('<div class="bz-localizable"></div>').after(languageDiv);

      languageDiv.addClass('input-group-btn bz-languages-language')
        .attr({
          'ng-include': '"' + 'views/cabinet/bzLocalizable.html' + '"'
        });

      $compile(languageDiv)(scope);

      scope.dropdown = { show: false };
      $rootScope.$watch('$contentLanguage', function (lang) {
        scope.language = lang;
        scope.dropdown.show = false;
      });

      scope.changeLanguage = function (lang) {
        $rootScope.$contentLanguage = lang;
      };

      scope.$watch(attrs.ngModel, function (value) {
        if (angular.isObject(value) || !$rootScope.$contentLanguage || $rootScope.$contentLanguage.code != defaultLocale) {
          return;
        }
        scope.$eval(attrs.bzLocalizable + '=$value', {$value: value});
      });
    }
  };
}