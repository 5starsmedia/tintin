'use strict';

var nestedSet = require('../../middleware/nestedSet.js');

function NotificationModule(app) {
  this.app = app;
}


NotificationModule.prototype.initModels = function () {
  this.app.models.notifications = require('./models/notifications.js');
};

NotificationModule.prototype.initRoutes = function () {
  this.app.server.use('/api/notifications', require('./routes/notifications.js'));
};

module.exports = NotificationModule;