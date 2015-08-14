'use strict';

var nestedSet = require('../../middleware/nestedSet.js');

function AdsModule(app) {
  this.app = app;
}

AdsModule.prototype.initModels = function () {
  this.app.models.adsCodes = require('./models/adsCodes.js');
};

AdsModule.prototype.initRoutes = function () {
};

module.exports = AdsModule;