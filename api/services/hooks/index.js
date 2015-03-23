'use strict';

var path = require('path'),
  _ = require('lodash'),
  async = require('async');

var plugins = {};

exports.loadPlugins = function (app, cb) {
  app.log.info('Loading hooks plugins started...');
  async.auto({
    fileList: function (next) {
      plugins = {};
      app.services.data.dirWalk(path.join(__dirname, 'plugins'), next);
    },
    readFiles: ['fileList', function (next, res) {
      async.each(res.fileList, function (filePath, next) {
        app.log.debug('Loading hooks plugins from file', filePath);
        var plugin = require(filePath);
        for (var taskName in plugin) {
          if (plugin.hasOwnProperty(taskName)) {
            var taskHandler = plugin[taskName];
            if (!plugins[taskName]) {
              plugins[taskName] = [];
            }
            plugins[taskName].push(taskHandler);
          }
        }
        next();
      }, next);
    }]
  }, function (err) {
    if (err) { return cb(err); }
    if (_.size(plugins) === 0) {
      app.log.warn('Hooks plugins loading procedure complete successfully, but plugins not found');
    } else {
      app.log.info('Hooks plugins loaded successfully - ', _.size(plugins));
    }
    cb();
  });
};

exports.hookAll = function (req, method, name, data, cb) {
  var tasks = [
    _.partial(exports.hook, req, method.toLowerCase() + '.' + name, data),
    _.partial(exports.hook, req, name, data)
  ]
    .concat(_.map(_.keys(data), function (key) {return  _.partial(exports.hook, req, name + '.' + key, data);}))
    .concat(_.map(_.keys(data), function (key) {return  _.partial(exports.hook, req, method.toLowerCase() + '.' + name + '.' + key, data);}));
  async.parallel(tasks, cb);
};

exports.hook = function (req, name, data, cb) {
  var handlers = plugins[name];
  if (handlers) {
    async.eachSeries(handlers, function (handler, next) {
      handler(req, data, next);
    }, cb);
  } else { cb(null, data); }
};
