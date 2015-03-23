export default
  /*@ngInject*/
  function AuthLoginInterceptor($q, $injector) {
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
        if (rejection.status === 401) {
          var $auth = $injector.get('$auth');
          $auth.logout();
        }
        return $q.reject(rejection);
      }
    };
  }