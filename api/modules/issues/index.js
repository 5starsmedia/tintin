'use strict';

var nestedSet = require('../../middleware/nestedSet.js');

function IssuesModule(app) {
  this.app = app;
}


IssuesModule.prototype.initModels = function () {
  this.app.models.issues = require('./models/issue.js');
  this.app.models.issueTypes = require('./models/issueType.js');
};

IssuesModule.prototype.initServices = function () {
};

IssuesModule.prototype.initRoutes = function () {
//  this.app.server.use('/api/issues', require('./routes/issues.js'));
};

module.exports = IssuesModule;