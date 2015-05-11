'use strict';

var nestedSet = require('../../middleware/nestedSet.js');

function UploadsModule(app) {
  this.app = app;
}


UploadsModule.prototype.initModels = function () {
  this.app.models.files = require('./models/files.js');
  this.app.models.fileChunks = require('./models/fileChunks.js');
};

UploadsModule.prototype.initRoutes = function () {
  this.app.server.use('/api/upload', require('./routes/upload.js'));
  this.app.server.use('/api/files', require('./routes/files.js'));
};

module.exports = UploadsModule;