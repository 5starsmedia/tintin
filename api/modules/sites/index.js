'use strict';

var nestedSet = require('../../middleware/nestedSet.js');

function SitesModule(app) {
  this.app = app;
}

SitesModule.prototype.initModels = function () {
  this.app.models.redirects = require('./models/redirect.js');
  this.app.models.sections = require('./models/section.js');
};

SitesModule.prototype.initRoutes = function () {
  this.app.server.use('/api/sites', require('./routes/sites.js'));
  this.app.server.use('/api/sections', require('./routes/sections.js'));
};

module.exports = SitesModule;