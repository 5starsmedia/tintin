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
          let $auth = $injector.get('$auth'),
            $location = $injector.get('$location'),
              $state = $injector.get('$state');

          $auth.logout();
          $location.path('/auth/login');
        }
        return $q.reject(rejection);
      }
    };
  }