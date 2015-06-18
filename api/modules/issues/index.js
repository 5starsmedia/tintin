'use strict';

var nestedSet = require('../../middleware/nestedSet.js'),
  crawler = require('./services/crawler'),
  googleSvc = require('./services/google'),
  yandexSvc = require('./services/yandex'),
  seoSvc = require('./services/seo');

function IssuesModule(app) {
  this.app = app;
}


IssuesModule.prototype.initModels = function () {
  this.app.models.issues = require('./models/issue.js');
};

IssuesModule.prototype.initServices = function () {
};

IssuesModule.prototype.initRoutes = function () {
//  this.app.server.use('/api/issues', require('./routes/issues.js'));
};

module.exports = IssuesModule;