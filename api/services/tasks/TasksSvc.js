/**
 * Tasks service class
 * @copyright 2015 Cannasos.com. All rights reserved.
 */
'use strict';

var async = require('async'),
  path = require('path'),
  Stomp = require('stomp-client'),
  domain = require('domain'),
  _ = require('lodash');

function TasksSvc(app) {
  var self = this;
  self.app = app;
  self.log = app.log.child({module: 'TasksSvc'});
  self.plugins = {};
  self.client = null;
  self.messagesInProcess = 0;
  self.subscriptionHandler = function (body) {
    var m = JSON.parse(body);
    self.log.debug('Tasks message "%s"', m.body.name);
    self.messagesInProcess += 1;
    self.processMessage(m, function (err) {
      self.messagesInProcess -= 1;
      if (err) { return app.log.error(err, err.toString()); }
    });
  };
}

TasksSvc.prototype.registerPlugin = function (filePath, next) {
  var self = this;
  var plugin = require(filePath);
  self.log.debug('Loading tasks plugins from file "%s"', filePath);
  for (var taskName in plugin) {
    if (plugin.hasOwnProperty(taskName)) {
      var taskHandler = plugin[taskName];
      if (!self.plugins[taskName]) {
        self.plugins[taskName] = [];
      }
      self.plugins[taskName].push(taskHandler);
    }
  }
  next();
};

TasksSvc.prototype.init = function (next) {
  var self = this;
  if (!self.app.config.get('tasks.enabled')) {
    self.app.log.info('Tasks processing disabled, skipping loading plugins and queue connection');
    return next();
  }
  self.log.info('Loading tasks plugins started...');
  async.auto({
    fileList: function (next) {
      self.plugins = {};
      self.app.services.data.dirWalk(path.join(__dirname, 'plugins'), next);
    },
    readFiles: ['fileList', function (next, res) {
      async.each(res.fileList, function (filePath, next) {
        self.registerPlugin(filePath, next);
      }, next);
    }],
    connect: function (next) {
      self.log.debug('Connecting to tasks stomp %s:%s...', self.app.config.get('tasks.stomp.host'),
        self.app.config.get('tasks.stomp.port'));
      self.client = new Stomp(self.app.config.get('tasks.stomp.host'), self.app.config.get('tasks.stomp.port'),
        self.app.config.get('tasks.stomp.login'), self.app.config.get('tasks.stomp.password'));
      self.client.on('error', function (err) {
        if (err) { return self.log.error(err); }
      });
      self.client.connect(function () {
        self.log.debug('Connecting to tasks stomp ready');
        next();
      });
    }
  }, function (err) {
    if (err) { return next(err); }
    var pluginsCount = Object.keys(self.plugins).length;
    if (pluginsCount === 0) {
      self.log.warn('Tasks plugins loading procedure complete successfully, but plugins not found');
    } else {
      self.log.info('Tasks plugins loaded successfully - %s', pluginsCount);
    }
    next();
  });
};

TasksSvc.prototype.processMessage = function (message, next) {
  var self = this;
  var handlers = self.plugins[message.body.name];
  if (Array.isArray(handlers) && handlers.length > 0) {
    async.each(handlers, function (handler, next) {
      var d = domain.create();
      d.on('error', function (err) {
        next(err);
      });
      d.run(function () {
        if (handler.length > 3) {
          handler({log: self.log.child({taskName: message.body.name})}, self.app, message, next);
        } else {
          handler(self.app, message, next);
        }
      });
    }, function (err) {
      if (err) { return next(err); }
      self.log.debug('Event "%s" processed successfully. Executed tasks - %s', message.body.name, handlers.length);
      next();
    });
  } else {
    self.log.debug('Event "%s" processed successfully without executing tasks', message.body.name);
    next();
  }
};


TasksSvc.prototype.start = function (next) {
  var self = this;
  if (!self.app.config.get('tasks.enabled')) {
    self.app.log.info('Tasks processing disabled, skipping queue subscribing');
  } else {
    self.log.info('Subscribing to tasks queue "%s"', self.app.config.get('tasks.stomp.destination'));
    self.client.subscribe(self.app.config.get('tasks.stomp.destination'), self.subscriptionHandler);
  }
  next();
};

TasksSvc.prototype.stop = function (next) {
  var self = this;
  if (!self.app.config.get('tasks.enabled')) {
    self.app.log.info('Tasks processing disabled, skipping queue unsubscribing');
  } else {
    self.log.info('Unsubscribing from tasks queue "%s"', self.app.config.get('tasks.stomp.destination'));
    self.client.unsubscribe(self.app.config.get('tasks.stomp.destination'), self.subscriptionHandler);
  }
  next();
};


TasksSvc.prototype.push = function (body, next) {
  var self = this;
  self.client.publish(self.app.config.get('tasks.stomp.destination'), JSON.stringify({body: body}));
  if (next) { next(); }
};

TasksSvc.prototype.publish = function (taskName, body, next) {
  var self = this;
  body.name = taskName;
  self.client.publish(self.app.config.get('tasks.stomp.destination'), JSON.stringify({body: body}));
  if (next) { next(); }
};


module.exports = TasksSvc;
