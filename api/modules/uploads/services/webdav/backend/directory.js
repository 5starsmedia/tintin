'use strict';

var url = require('url'),
  crypto = require('crypto'),
  mime = require('mime'),
  mongoose = require('mongoose');

var mongoFile = require("./file");

var jsDAVCollection = require("jsDAV/lib/DAV/collection");
var jsExceptions = require("jsDAV/lib/shared/exceptions");
var Util = require("jsDAV/lib/shared/util");

function escapeRegExp(string) {
  return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

var emptyFilename = '.empty';
var mongoDirectory = jsDAVCollection.extend(
  {
    initialize: function (tree, name) {
      this.tree = tree;
      this.path = name || '';
      this.name = name;
    },

    getChildren: function (next) {
      var self = this;

      mongoose.connection.db.collection('fs.files')
        .find({
          filename: {
            $regex: self.tree.getFolderNameForMongo(this.path),
            $ne: self.tree.getFileNameForMongo(this.path) + '/' + emptyFilename
          }
        })
        .toArray(function (err, nodes) {
          if (err) {
            return next(err);
          }

          next(null, nodes.map(function (file) {
            if (file.filename.substring(file.filename.length - emptyFilename.length) == emptyFilename) {
              var path = file.filename.substring(0, file.filename.length - emptyFilename.length);
              return mongoDirectory.new(self.tree, path);
            }
            return mongoFile.new(self.tree, file);
          }));
        });
    },

    createDirectory: function (name, next) {
      var fileName = this.tree.getFileNameForMongo(Util.trim(this.path + '/' + name, "/") + '/' + emptyFilename);
      var gridStore = new mongoose.mongo.GridStore(mongoose.connection.db, fileName, "w");

      gridStore.open(function (err) {
        if (err) {
          return next(err);
        }

        gridStore.write('', function (err) {
          if (err) {
            return next(err);
          }

          gridStore.close(function (err) {
            if (err) {
              return next(err);
            }

            next();
          });
        });
      });
    },

    createFile: function (name, data, enc, next) {
      var newPath = Util.trim(this.path + '/' + name, "/");
      if (data.length === 0) {
        data = new Buffer(0);
        enc = "binary";
      }

      var options = {
        content_type: mime.lookup(newPath),
      };

      var gridStore = new mongoose.mongo.GridStore(mongoose.connection.db, this.tree.getFileNameForMongo(newPath), "w", options);
      gridStore.open(function (err) {
        if (err) { return next(err); }

        gridStore.write(data, function (err) {
          if (err) { return next(err); }

          gridStore.close(next);
        });
      });
    },

    getChild: function (name, next) {
      var self = this;
      var path = Util.trim(this.path + '/' + name, '/');

      mongoose.connection.db.collection('fs.files')
        .find({filename: self.tree.getFileNameForMongo(path + '/.empty')})
        .toArray(function (err, files) {
          if (err) {
            return next(err);
          }
          if (!files.length) {
            return next(new jsExceptions.NotFound("File not found"));
          }

          return next(null, mongoDirectory.new(self.tree, path));
        });
    },

    childExists: function (name, callback) {
      console.info('childExists', name)
      var exists = (this.children[name] !== undefined);
      console.info(name, exists)
      callback(null, exists);
    },

    getName: function () {
      return this.name;
    },

    "delete": function(next) {
      mongoose.connection.db.collection('fs.files')
        .remove({filename: { $regex: this.tree.getFolderNameForMongo(this.path) } }, next);
    },

    getLastModified: function(next) {
      next(null, new Date());
    },

    exists: function (next) {
      console.info('exists')
    }
  });

module.exports = mongoDirectory;