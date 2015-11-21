var appName = 'module.contacts.models';

var module = angular.module(appName, [
  'ngResource',
  'ngEditableTree'
]);

// models
import ContactsGeoModel from './ContactsGeoModel.js';

module.factory('ContactsGeoModel', ContactsGeoModel);

export default appName;