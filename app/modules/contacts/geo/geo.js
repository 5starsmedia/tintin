var appName = 'module.contacts.geo';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'satellizer',
  'uiGmapgoogle-maps',
  models
]);

// controllers
import ContactsGeoCtrl from './controllers/ContactsGeoCtrl.js';
import ContactsGeoEditCtrl from './controllers/ContactsGeoEditCtrl.js';

module
  .controller('ContactsGeoCtrl', ContactsGeoCtrl)
  .controller('ContactsGeoEditCtrl', ContactsGeoEditCtrl)
;

// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('contacts', {
      abstract: true,
      parent: 'cabinet',
      template: '<div ui-view></div>'
    })
    .state('contacts.geo', {
      url: "/contacts",
      controller: 'ContactsGeoCtrl',
      templateUrl: "views/modules/contacts/page-geo.html",
      data: {
        specialClass: 'constructor'
      }
    })
});

export default appName;
