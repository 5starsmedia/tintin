'use strict';

var nestedSet = require('../../middleware/nestedSet.js'),
  webdavSvc = require('./services/webdav');

function UploadsModule(app) {
  this.app = app;
}


UploadsModule.prototype.initModels = function () {
  this.app.models.files = require('./models/files.js');
  this.app.models.fileChunks = require('./models/fileChunks.js');
  this.app.models.webdavUsers = require('./models/webdavUser.js');
};

UploadsModule.prototype.initServices = function () {
  this.app.services.webdav = new webdavSvc.WebdavSvc(this.app);
};

UploadsModule.prototype.initRoutes = function () {
  this.app.server.use('/api/upload', require('./routes/upload.js'));
  this.app.server.use('/api/files', require('./routes/files.js'));
  this.app.server.use('/api/webdav', require('./routes/webdav.js'));
};

UploadsModule.prototype.initServer = function () {
//  this.app.services.webdav.start();
};

module.exports = UploadsModule;