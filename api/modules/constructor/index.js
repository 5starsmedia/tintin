'use strict';

var nestedSet = require('../../middleware/nestedSet.js'),
  statesSvc = require('./services/states');

function ConstructorModule(app) {
  this.app = app;
}

ConstructorModule.prototype.initModels = function () {
  this.app.models.states = require('./models/state.js');
};

ConstructorModule.prototype.initServices = function () {
  this.app.services.states = new statesSvc.StatesSvc(this.app);
};

ConstructorModule.prototype.initRoutes = function () {
  //this.app.server.use('/api/states', require('./routes/states.js'));
  this.app.server.use('/api/states', require('./routes/states.js'), nestedSet('states'));
};

module.exports = ConstructorModule;