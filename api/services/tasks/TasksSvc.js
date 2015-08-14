/**
 * Tasks service class
 * @module services/tasks/TaskSvc
 * @copyright 2015 Cannasos.com. All rights reserved.
 */
'use strict';

var async = require('async'),
  path = require('path'),
  stompit = require('stompit');

function TasksSvc(app) {
  var self = this;
  self.app = app;
  self.log = app.log.child({module: 'TasksSvc'});
  self.plugins = {};
  self.client = null;
  self.messagesInProcess = 0;
  self.subscriptionHandler = function (body) {
    var message = JSON.parse(body);
    self.log.debug('Tasks message "%s"', message.body.name);
    self.messagesInProcess += 1;
    var startAt = process.hrtime();
    self.processMessage(message, function (err) {
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

  self.connectionManager = new stompit.ConnectFailover([
    {
      host: self.app.config.get('tasks.stomp.host'),
      port: self.app.config.get('tasks.stomp.port'),
      resetDisconnect: true,
      connectHeaders: {
        host: '/',
        login: self.app.config.get('tasks.stomp.login'),
        passcode: self.app.config.get('tasks.stomp.password'),
        'heart-beat': '1000,1000'
      }
    }
  ]);

  self.connectionManager.on('error', function (error) {
    var connectArgs = error.connectArgs;
    var address = connectArgs.host + ':' + connectArgs.port;
    self.log.error('Could not connect to tasks stomp ' + address + ': ' + error.message);
  });

  /*self.connectionManager.on('connecting', function (connector) {
   self.log.debug('Connecting to tasks stomp ' + connector.serverProperties.remoteAddress.transportPath);
   });*/

  self.channelPool = stompit.ChannelPool(self.connectionManager);

  async.auto({
    fileList: function (next) {
      self.plugins = {};
      if (!self.app.config.get('tasks.enabled')) {
        self.log.info('Tasks processing disabled, skipping loading plugins');
        return next(null, []);
      }
      self.log.info('Loading tasks plugins started...');
      self.app.services.data.dirWalk(path.join(__dirname, 'plugins'), next);
    },
    plugins: ['fileList', function (next, res) {
      async.each(res.fileList, function (filePath, next) {
        if (path.extname(filePath) !== '.js') { return next(); }
        self.registerPlugin(filePath, next);
      }, next);
    }],
    reportPlugins: ['plugins', function (next) {
      if (!self.app.config.get('tasks.enabled')) { return next(); }
      var pluginsCount = Object.keys(self.plugins).length;
      if (pluginsCount === 0) {
        self.log.warn('Tasks plugins loading procedure complete successfully, but plugins not found');
      } else {
        self.log.info('Tasks plugins loaded successfully - %s', pluginsCount);
      }
      next();
    }]
  }, next);
};

TasksSvc.prototype.processMessage = function (message, next) {
  var self = this;
  var handlers = self.plugins[message.body.name];
  if (Array.isArray(handlers) && handlers.length > 0) {
    async.each(handlers, function (handler, next) {
      if (handler.length > 3) {
        handler({log: self.log.child({taskName: message.body.name})}, self.app, message, next);
      } else {
        handler(self.app, message, next);
      }
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

TasksSvc.prototype.start = function () {
  var self = this;
  if (!self.app.config.get('tasks.enabled')) {
    self.app.log.info('Tasks processing disabled, skipping queue subscribing');
  } else {
    self.log.info('Subscribing to tasks queue "%s"', self.app.config.get('tasks.stomp.destination'));

    var subscribeHeaders = {
      'destination': self.app.config.get('tasks.stomp.destination'),
      'ack': 'auto'
    };
    self.log.debug('Subscribe to destination "%s"', self.app.config.get('tasks.stomp.destination'));
    self.channelPool.channel(function (err, channel) {
      if (err) {
        return self.log.error('Channel error', err.message);
      }
      channel.subscribe(subscribeHeaders, function (err, message, subscription) {
        if (err) {
          return self.log.error('Subscribe error', err.message);
        }
        message.readString('utf-8', function (err, body) {
          if (err) { return self.log.error('Message read error', err.message); }
          message.ack();
          self.subscriptionHandler(body);
        });
      });
    });
  }
};

TasksSvc.prototype.push = function (body, next) {
  var self = this;
  self.channelPool.channel(function (err, channel) {
    if (err) { self.log.error('Send-channel error: ' + err.message); }
    var sendHeaders = {
      'destination': self.app.config.get('tasks.stomp.destination'),
      'content-type': 'application/json'
    };
    channel.send(sendHeaders, JSON.stringify({body: body}), function (err) {
      if (err) {
        return (typeof next === 'function') ? next(err) : self.log.error('Send-channel error: ' + err.message);
      }
      if (typeof next === 'function') { next(); }
    });
  });
};

TasksSvc.prototype.publish = function (taskName, body, next) {
  body.name = taskName;
  this.push(body, next);
};

module.exports = TasksSvc;