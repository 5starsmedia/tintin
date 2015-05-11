'use strict';

var nestedSet = require('../../middleware/nestedSet.js');

function WikiModule(app) {
  this.app = app;
}

WikiModule.prototype.initModels = function () {
  this.app.models.wikiPages = require('./models/wikiPage.js');
};

WikiModule.prototype.initRoutes = function () {
};

module.exports = WikiModule;