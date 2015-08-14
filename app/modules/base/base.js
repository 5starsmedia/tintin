'use strict';

import appCtrl from './controllers/appCtrl.js';
import clockCtrl from './controllers/clockCtrl.js';

import minimalizaMenu from './directives/minimalizaMenu.js';
import sparkline from './directives/sparkline.js';
import icheck from './directives/icheck.js';
import panelTools from './directives/panelTools.js';
import smallHeader from './directives/smallHeader.js';
import animatePanel from './directives/animatePanel.js';

var appName = 'module.base';

angular.module(appName, [
  'ui.router',                // Angular flexible routing
  'ui.bootstrap',             // AngularJS native directives for Bootstrap
  'angular-flot',             // Flot chart
  'angles',                   // Chart.js
  'angular-peity',            // Peity (small) charts
  'cgNotify',                 // Angular notify
  'angles',                   // Angular ChartJS
])
  .controller('appCtrl', appCtrl)
  .controller('clockCtrl', clockCtrl)
  .directive('minimalizaMenu', minimalizaMenu)
  .directive('sparkline', sparkline)
  .directive('icheck', icheck)
  .directive('panelTools', panelTools)
  .directive('smallHeader', smallHeader)
  .directive('animatePanel', animatePanel);

export default appName;