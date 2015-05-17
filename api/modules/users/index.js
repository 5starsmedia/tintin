'use strict';

var nestedSet = require('../../middleware/nestedSet.js'),
  requireAccount = require('../../middleware/requireAccount.js');

function UsersModule(app) {
  this.app = app;
}

UsersModule.prototype.initModels = function () {
};

UsersModule.prototype.initRoutes = function () {
  this.app.server.use('/api/auth/permissions', requireAccount(), require('./routes/permissions.js'));
  this.app.server.use('/api/auth', require('./routes/auth.js'));
};

module.exports = UsersModule;