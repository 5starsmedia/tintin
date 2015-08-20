var appName = 'module.sites.models';

var module = angular.module(appName, [
  'ngResource'
]);

// models
import SiteDomainModel from './SiteDomainModel.js';
import SiteDnsRecordModel from './SiteDnsRecordModel.js';
import SiteDnsDomainModel from './SiteDnsDomainModel.js';

module.factory('SiteDomainModel', SiteDomainModel);
module.factory('SiteDnsRecordModel', SiteDnsRecordModel);
module.factory('SiteDnsDomainModel', SiteDnsDomainModel);

export default appName;