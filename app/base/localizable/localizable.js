var appName = 'base.localizable';

let module = angular.module(appName, [
]);

// factories
import bzLocalizable from './directives/bzLocalizable.js';

module.directive('bzLocalizable', bzLocalizable);


module.run(($rootScope) => {

  $rootScope.$contentLanguageId = window.config.language;
  $rootScope.$contentLanguages = window.config.languages;

});

export default appName;