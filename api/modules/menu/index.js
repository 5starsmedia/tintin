'use strict';

var nestedSet = require('../../middleware/nestedSet.js');

function MenuModule(app) {
  this.app = app;
}

MenuModule.prototype.initModels = function () {
  this.app.models.menuElements = require('./models/menuElements.js');
};

MenuModule.prototype.initRoutes = function () {
  this.app.server.use('/api/menuElements', nestedSet('menuElements'));
};

module.exports = MenuModule;