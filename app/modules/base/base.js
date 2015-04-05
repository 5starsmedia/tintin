'use strict';

import config from './config.js';
import appCtrl from './controllers/appCtrl.js';
import clockCtrl from './controllers/clockCtrl.js';

import pageTitle from './directives/pageTitle.js';
import sideNavigation from './directives/sideNavigation.js';
import minimalizaMenu from './directives/minimalizaMenu.js';
import sparkline from './directives/sparkline.js';
import icheck from './directives/icheck.js';
import panelTools from './directives/panelTools.js';
import smallHeader from './directives/smallHeader.js';
import animatePanel from './directives/animatePanel.js';
import landingScrollspy from './directives/landingScrollspy.js';
import bzLoadingContainer from './directives/bzLoadingContainer.js';

var appName = 'module.base';

import permissions from './permissions/permissions';

angular.module(appName, [
  'ui.router',                // Angular flexible routing
  'ui.bootstrap',             // AngularJS native directives for Bootstrap
  'angular-flot',             // Flot chart
  'angles',                   // Chart.js
  'angular-peity',            // Peity (small) charts
  'cgNotify',                 // Angular notify
  'angles',                   // Angular ChartJS
  'ngAnimate',                // Angular animations
  'ui.map',                   // Ui Map for Google maps
  'ui.calendar',              // UI Calendar
  'summernote',               // Summernote plugin
  'ngGrid',                   // Angular ng Grid
  'ui.tree',                  // Angular ui Tree
  'ngProgress',
  permissions
])
  .config(config)
  .controller('appCtrl', appCtrl)
  .controller('clockCtrl', clockCtrl)
  .run(function($rootScope, $state) {
    $rootScope.$state = $state;
    $rootScope.$on('$stateChangeError', function(event) {
      $state.go('error.404');
    });
  })

  .directive('pageTitle', pageTitle)
  .directive('sideNavigation', sideNavigation)
  .directive('minimalizaMenu', minimalizaMenu)
  .directive('sparkline', sparkline)
  .directive('icheck', icheck)
  .directive('panelTools', panelTools)
  .directive('smallHeader', smallHeader)
  .directive('animatePanel', animatePanel)
  .directive('landingScrollspy', landingScrollspy)
  .directive('bzLoadingContainer', bzLoadingContainer)

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
  });

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