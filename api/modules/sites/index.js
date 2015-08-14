'use strict';

var nestedSet = require('../../middleware/nestedSet.js');

function SitesModule(app) {
  this.app = app;
}

SitesModule.prototype.initModels = function () {
};

SitesModule.prototype.initRoutes = function () {
  this.app.server.use('/api/sites', require('./routes/sites.js'));
};

module.exports = SitesModule;