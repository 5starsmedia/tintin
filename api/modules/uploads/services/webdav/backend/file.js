'use strict';

var url = require('url'),
  crypto = require('crypto'),
  mime = require('mime'),
  mongoose = require('mongoose');

var jsDAV = require("jsDAV/lib/jsdav");
var jsDAVLocksBackendFS = require("jsDAV/lib/DAV/plugins/locks/fs");
var jsDAVFile = require("jsDAV/lib/DAV/file");
var jsDAVCollection = require("jsDAV/lib/DAV/collection");
var jsExceptions = require("jsDAV/lib/shared/exceptions");

module.exports = jsDAVFile.extend(
  {
    initialize: function(file) {
      this.path = file.filename;
      this.name = file.filename;
      this.file = file;
    },

    getName: function() {
      return this.name;
    },

    get: function(next) {
      if (!this.file.length) {
        return next(null, new Buffer(0));
      }
      var gridStore = new mongoose.mongo.GridStore(mongoose.connection.db, this.file._id, "r");

      gridStore.open(function(err, gs) {
        if (err) { return next(err); }

        gridStore.read(function (err, data) {
          if (err) { return next(err); }

          gridStore.close(function(err) {
            if (err) { return next(err); }

            next(null, data);
          });
        });
      });
    },

    getLastModified: function(callback) {
      callback(null, this.file.uploadDate);
    },

    put: function(data, type, next) {
      var options = {
        content_type: mime.lookup(this.path),
      };

      var gridStore = new mongoose.mongo.GridStore(mongoose.connection.db, this.path, "w", options);
      gridStore.open(function(err) {
        if (err) { return next(err); }

        gridStore.write(data, function(err) {
          if (err) { return next(err); }

          gridStore.close(function(err) {
            if (err) { return next(err); }

            next();
          });
        });
      });
    },

    getSize: function(callback) {
      callback(null, this.file.length);
    },

    getETag: function(callback) {
      callback(null, this.file.md5);
    },

    getContentType: function(callback) {
      callback(null, this.file.contentType);
    },

    "delete": function(next) {
      mongoose.connection.db.collection('fs.files')
        .remove({filename: { $regex: this.path } }, next);
    },

    exists: function(next) {
      this.getLastModified(function(err) {
        next(!!err);
      });
    }
  });
