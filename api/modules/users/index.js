'use strict';

var nestedSet = require('../../middleware/nestedSet.js'),
  requireAccount = require('../../middleware/requireAccount.js');

function UsersModule(app) {
  this.app = app;
}

UsersModule.prototype.initModels = function () {
  this.app.models.roles = require('./models/role.js');
};

UsersModule.prototype.initRoutes = function () {
  this.app.server.use('/api/auth', require('./routes/auth.js'));
  this.app.server.use('/api/users/permissions', require('./routes/permissions.js'));
};

module.exports = UsersModule;