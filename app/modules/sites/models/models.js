var appName = 'module.sites.models';

var module = angular.module(appName, [
  'ngResource'
]);

// models
import SiteDomainModel from './SiteDomainModel.js';

module.factory('SiteDomainModel', SiteDomainModel);

export default appName;