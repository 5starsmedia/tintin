//stUserAgentIcon
export default
  /*@ngInject*/
  function ($rootScope) {
    return function (input) {
      if (angular.isObject(input)) {
        return input[$rootScope.currentLocale] || input['en-US'];
      }
      var translates = $rootScope.translates || {};
      return translates[input] || input;
    };
  };