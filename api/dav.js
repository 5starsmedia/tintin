"use strict";
/*
var jsDAV = require("jsDAV");
//jsDAV.debugMode = true;
var jsDAV_Locks_Backend_FS = require("./node_modules/jsDAV/lib/DAV/plugins/locks/fs");

jsDAV.createServer({
  node: __dirname + "/../sites",
  locksBackend: jsDAV_Locks_Backend_FS.new(__dirname + "/../sites")
}, 8000);*/

'use strict';

var crypto = require('crypto');

var jsDAV = require("jsDAV/lib/jsdav");
var jsDAVLocksBackendFS = require("jsDAV/lib/DAV/plugins/locks/fs");
var jsDAVFile = require("jsDAV/lib/DAV/file");
var jsDAVCollection = require("jsDAV/lib/DAV/collection");
var jsExceptions = require("jsDAV/lib/shared/exceptions");
//jsDAV.debugMode = true;
var VirtualFile = jsDAVFile.extend(
  {
    initialize: function(name, buffer) {
      this.path = name;
      this.name = name;
      this.buffer = buffer;
    },

    getName: function() {
      return this.name;
    },

    get: function(callback) {
      callback(null, this.buffer);
    },

    put: function(data, type, callback) {
      this.buffer = data;
      //console.info(data, type);
      callback();
      //callback(new jsExceptions.Forbidden("Permission denied to change data"));
    },

    getSize: function(callback) {
      callback(null, this.buffer.length);
    },

    getETag: function(callback) {
      var shasum = crypto.createHash('sha1');
      shasum.update(this.buffer);
      var etag = '"' + shasum.digest('hex') + '"';
      callback(null, etag);
    },

    getContentType: function(callback) {
      callback(null, 'text/plain');
    }
  });

var VirtualDirectory = jsDAVCollection.extend(
  {
    initialize: function(name, children) {
      this.path = name || '.';
      this.name = name;
      this.children = children;
    },

    getChildren: function(callback) {
      var list = [];
      for (var name in this.children) {
        list.push(this.children[name]);
      }
      callback(null, list);
    },

    createDirectory: function(name, callback) {
      this.children[name] = VirtualDirectory.new(name);
      callback();
    },

    createFile: function(name, data, enc, callback) {
      //var newPath = this.path + "/" + name;
      this.children[name] = VirtualFile.new(name, new Buffer(data, 'binary'));
      callback();
    },

    getChild: function(name, callback) {
      this.children = this.children || {};
      var child = this.children[name];
      if (child) {
        callback(null, child);
      } else {
        callback(new jsExceptions.NotFound("File not found"));
      }
    },

    childExists: function(name, callback) {
      var exists = (this.children[name] !== undefined);
      console.info(name, exists)
      callback(null, exists);
    },

    getName: function() {
      return this.name;
    }
  });

var children = {};
for (var i = 1; i <= 10; i++) {
  var name = 'file' + i + '.txt';
  var text = 'Hello world, #' + i;
  children[name] = VirtualFile.new(name, new Buffer(text, 'utf8'));
}

var grandchildren = {};
for (var i = 66; i <= 99; i++) {
  var name = 'beer' + i + '.txt';
  var text = i + ' bottles of beer';
  grandchildren[name] = VirtualFile.new(name, new Buffer(text, 'utf8'));
}
children['folder'] = VirtualDirectory.new('folder', grandchildren);

var root = VirtualDirectory.new(null, children);

var options = {
  node: root,
  locksBackend: jsDAVLocksBackendFS.new(__dirname + "/data")
};
var port = 8000;

jsDAV.createServer(options, port);