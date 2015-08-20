var appName = 'module.sites.dns';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'sticky',
  models
]);

// controllers
import SitesDnsCtrl from './controllers/SitesDnsCtrl.js';
import SitesDnsRecordEditCtrl from './controllers/SitesDnsRecordEditCtrl.js';

module.controller('SitesDnsCtrl', SitesDnsCtrl);
module.controller('SitesDnsRecordEditCtrl', SitesDnsRecordEditCtrl);


// config
module.config(() => {
});

export default appName;