'use strict';

var nestedSet = require('../../middleware/nestedSet.js');

function ServersModule(app) {
  this.app = app;
}


ServersModule.prototype.initModels = function () {
  this.app.models.nodeServers = require('./models/nodeServer.js');
};

ServersModule.prototype.initRoutes = function () {
};

module.exports = ServersModule;