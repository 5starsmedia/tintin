'use strict';

var url = require('url'),
  crypto = require('crypto'),
  mongoose = require('mongoose');

var jsDAV = require("jsDAV/lib/jsdav");
var jsDAVLocksBackendFS = require("jsDAV/lib/DAV/plugins/locks/fs");
var jsDAVFile = require("jsDAV/lib/DAV/file");
var jsDAVCollection = require("jsDAV/lib/DAV/collection");
var jsExceptions = require("jsDAV/lib/shared/exceptions");

var jsDAV_Tree_MongoDB = require("./backend/tree");

function WebdavSvc(app) {
  this.app = app;
}

WebdavSvc.prototype.start = function () {
  var host = this.app.config.get('webdav.ip'),
    port = this.app.config.get('webdav.port');

  var options = {
    tree: jsDAV_Tree_MongoDB.new(this.app),
    locksBackend: jsDAVLocksBackendFS.new(__dirname + "/data")
  };
  //jsDAV.debugMode = true;
  jsDAV.createServer(options, port, host);

  this.app.log.info('WebDav Server started at ' + host + ':' + port);
};

module.exports = WebdavSvc;
