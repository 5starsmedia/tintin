/**
 * Copyright 2014 Cannasos.com
 */
'use strict';

var fs = require('fs'),
  _ = require('lodash'),
  path = require('path'),
  async = require('async'),
  NotFoundError = require('../../errors/NotFoundError.js');

exports.dirWalk = function dirWalk(dir, cb) {
  var results = [];
  fs.readdir(dir, function (err, list) {
    if (err) { return cb(err); }
    var i = 0;
    (function next() {
      var file = list[i];
      i += 1;
      if (!file) {
        return cb(null, results);
      }
      file = path.join(dir, file);
      fs.stat(file, function (err, stat) {
        if (err) { return cb(err); }
        if (stat && stat.isDirectory()) {
          dirWalk(file, function (err, res) {
            if (err) { return cb(err); }
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

var resources = {};

var plugins = {
  json: require('./plugins/json.js')
};

exports.loadResources = function (app, cb) {
  var dataDir = path.resolve(__dirname, '..', '..', 'data');
  resources = {};
  app.log.info('Loading resources from folder', dataDir);
  async.auto({
    filesList: function (next) {
      exports.dirWalk(dataDir, next);
    },
    jsonContent: ['filesList', function (next, res) {
      async.each(res.filesList, function (name, nxt) {
        var ext = path.extname(name).replace(/^\./, '');
        plugins[ext](app, name, function (err, data) {
          if (err) {return next(err); }
          var relName = path.relative(dataDir, name);
          var resName = relName.substring(0, relName.length - ext.length - 1)
            .replace(path.sep, '.');
          resources[resName] = data;
          app.log.debug('Loaded resource from file', resName);
          nxt();
        });
      }, next);
    }]
  }, function (err) {
    if (err) {return cb(err);}
    app.log.info('Resources loaded successfully -', _.size(resources));
    cb();
  });
};

exports.getResource = function (name, cb) {
  var res = resources[name];
  if (!res) { return cb(new NotFoundError('Resource "' + name + '" not found.')); }
  res(cb);
};
