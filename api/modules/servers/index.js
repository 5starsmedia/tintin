'use strict';

var nestedSet = require('../../middleware/nestedSet.js');

function ServersModule(app) {
  this.app = app;
}


ServersModule.prototype.initModels = function () {
  this.app.models.nodeServers = require('./models/nodeServer.js');
  this.app.models.dnsRecords = require('./models/dnsRecord.js');
  this.app.models.dnsDomains = require('./models/dnsDomain.js');
};

ServersModule.prototype.initRoutes = function () {
};

module.exports = ServersModule;