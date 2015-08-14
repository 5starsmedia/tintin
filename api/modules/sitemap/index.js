'use strict';

var nestedSet = require('../../middleware/nestedSet.js');

function SitemapModule(app) {
  this.app = app;
}


SitemapModule.prototype.initModels = function () {
  this.app.models.sitemaps = require('./models/sitemaps.js');
  this.app.models.sitemapUrls = require('./models/sitemapUrls.js');
};

SitemapModule.prototype.initRoutes = function () {
  this.app.server.use('/api', require('./routes/sitemap.js'));
};

module.exports = SitemapModule;