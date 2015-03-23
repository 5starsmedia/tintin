let appName = 'module.auth.login';

let module = angular.module(appName, [
  'ui.router',
  'satellizer',
  'ngResource'
]);

// controllers
import AuthLoginCtrl from './controllers/AuthLoginCtrl.js';
import AuthLogoutCtrl from './controllers/AuthLogoutCtrl.js';

module.controller('AuthLoginCtrl', AuthLoginCtrl)
      .controller('AuthLogoutCtrl', AuthLogoutCtrl);

// factories
import AuthLoginInterceptor from './factories/AuthLoginInterceptor.js';

module.factory('AuthLoginInterceptor', AuthLoginInterceptor);

// config
module.config(function ($stateProvider, $httpProvider, $authProvider) {
  $httpProvider.interceptors.push('AuthLoginInterceptor');

  $stateProvider
    .state('auth', {
      abstract: true,
      url: "/auth",
      templateUrl: "views/common/content_empty.html",
      data: {
        pageTitle: 'Auth'
      }
    })
    .state('auth.login', {
      url: '/login',
      templateUrl: 'views/common_app/login.html',
      controller: 'AuthLoginCtrl'
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'partials/signup.html',
      controller: 'SignupCtrl'
    })
    .state('auth.logout', {
      url: '/logout',
      template: null,
      controller: 'AuthLogoutCtrl'
    });


  $authProvider.loginUrl = '/api/auth/login';
  $authProvider.facebook({
    scope: 'email',
    url: '/api/auth/facebook/callback'
  });

  $authProvider.oauth2({
    name: 'vk',
    url: '/api/auth/vk',
    redirectUri: window.location.origin,
    clientId: (config.vk || {}).clientId || '',
    authorizationEndpoint: 'https://oauth.vk.com/authorize'
  });

  if (config.facebook && config.facebook.clientId) {
    $authProvider.facebook({
      clientId: config.facebook.clientId
    });
  }
}).run(function($rootScope, $state) {
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    event.preventDefault();
    if (error.status == '403') {
      $state.go('auth.login');
    }
  });
});

export default appName;