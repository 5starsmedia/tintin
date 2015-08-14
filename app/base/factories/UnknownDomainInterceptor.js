export default
  /*@ngInject*/
  function UnknownDomainInterceptor($q, $injector) {
    return {
      'request': function (config) {
        return config;
      },
      'requestError': function (rejection) {
        return $q.reject(rejection);
      },
      'response': function (response) {
        return response;
      },
      'responseError': function (rejection) {
        if (rejection.status === 418) {
          let $state = $injector.get('$state');
          $state.go('error-418');
        }
        return $q.reject(rejection);
      }
    };
  }