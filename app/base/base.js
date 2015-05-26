'use strict';

var appName = 'base';

import permissions from './permissions/permissions';

import BaseAPIParams from './factories/BaseAPIParams.js';

import translate from './filters/translate.js';
import trim from './filters/trim.js';

// directives
import baseMetaEdit from './directives/baseMetaEdit.js';
import bzLoadingContainer from './directives/bzLoadingContainer.js';

angular.module(appName, [
  'views',
  permissions,
  'ui.router',
  'cgNotify',
  'ngAnimate',
  'ngProgress'
])
  .constant('appTitle', 'Paphos CMS')
  .constant('appSite', '5starsmedia.com.ua')
  .constant('appSiteLink', 'https://5starsmedia.com.ua/')
  .constant('BaseAPIParams', BaseAPIParams)
  .filter('translate', translate)
  .filter('trim', trim)

  // redirect on 404 where no route
  .run(function($rootScope, $state) {
    $rootScope.$state = $state;
    $rootScope.$on('$stateChangeError', function(event) {
      $state.go('error.404');
    });
  })

  .run(function($rootScope, ngProgress) {
    $('.splash').css('display', 'none')

    ngProgress.color('#62cb31');
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
      ngProgress.start();
    });
    $rootScope.$on('$stateChangeSuccess', function() {
      ngProgress.complete();
      setTimeout(function () {
        fixWrapperHeight();
      }, 30);
    });
    $rootScope.$on('$stateChangeError', function() {
      ngProgress.reset();
    });
  })

  .run(($rootScope, appTitle, appSite, appSiteLink, basePermissionsSet) => {
    $rootScope.appTitle = appTitle;
    $rootScope.appSite = appSite;
    $rootScope.appSiteLink = appSiteLink;

    $rootScope.hasPermission = basePermissionsSet.access;
  })

  .directive('bzLoadingContainer', bzLoadingContainer)

  .directive('baseMetaEdit', baseMetaEdit);


export default appName;




$(document).ready(function () {

  moment.locale('uk');

  // Set minimal height of #wrapper to fit the window
  fixWrapperHeight();

  // Add special class to minimalize page elements when screen is less than 768px
  setBodySmall();

});

$(window).bind("resize click", function () {

  // Add special class to minimalize page elements when screen is less than 768px
  setBodySmall();

  // Waint until metsiMenu, collapse and other effect finish and set wrapper height
  setTimeout(function () {
    fixWrapperHeight();
  }, 30);
})

function fixWrapperHeight() {

  // Get and set current height
  var headerH = 62;
  var navigationH = $("#navigation").height();
  var contentH = $(".content").height();

  // Set new height when contnet height is less then navigation
  if (contentH < navigationH) {
    $("#wrapper").css("min-height", navigationH + 'px');
  }

  // Set new height when contnet height is less then navigation and navigation is less then window
  if (contentH < navigationH && navigationH < $(window).height()) {
    $("#wrapper").css("min-height", $(window).height() - headerH  + 'px');
  }

  // Set new height when contnet is higher then navigation but less then window
  if (contentH > navigationH && contentH < $(window).height()) {
    $("#wrapper").css("min-height", $(window).height() - headerH + 'px');
  }
}


function setBodySmall() {
  if ($(window).width() < 769) {
    $('body').addClass('page-small');
  } else {
    $('body').removeClass('page-small');
    $('body').removeClass('show-sidebar');
  }
}