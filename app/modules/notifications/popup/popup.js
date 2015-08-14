var appName = 'module.notifications.popup';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'ngSanitize'
]);

// controllers
import NotificationsPopupCtrl from './controllers/NotificationsPopupCtrl.js';

module.controller('NotificationsPopupCtrl', NotificationsPopupCtrl);


// config
module.config(function ($stateProvider) {
});

export default appName;