var appName = 'module.sites.export-import';

import models from '../models/models.js';

let module = angular.module(appName, [
    'base',
    'ui.router',
    'sticky',
    models
]);

// controllers
import SitesExportImportCtrl from './controllers/SitesExportImportCtrl.js';

module
    .controller('SitesExportImportCtrl', SitesExportImportCtrl)
;

export default appName;