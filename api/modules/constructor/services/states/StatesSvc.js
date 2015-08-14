'use strict';

var async = require('async'),
  request = require('request'),
  cheerio = require('cheerio'),
  stompit = require('stompit'),
  path = require('path'),
  _ = require('lodash');

function StatesSvc(app) {
  this.app = app;
  this.log = app.log.child({module: 'StatesSvc'});
  this.plugins = {};
  this.client = null;
  this.messagesInProcess = 0;
  var self = this;
  self.subscriptionHandler = function (body) {
    var message = JSON.parse(body);
    self.log.debug('States message "%s"', message.body.name);
    self.messagesInProcess += 1;
    var startAt = process.hrtime();
    self.processMessage(message, function (err) {
      self.messagesInProcess -= 1;
      if (err) { return app.log.error(err, err.toString()); }
    });
  };
}

StatesSvc.prototype.registerPlugin = function (filePath, next) {
  var self = this;
  var plugin = require(filePath);
  self.log.debug('Loading states plugins from file "%s"', filePath);
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

StatesSvc.prototype.init = function (next) {
  var self = this;
  self.connectionManager = new stompit.ConnectFailover([
    {
      host: self.app.config.get('states.stomp.host'),
      port: self.app.config.get('states.stomp.port'),
      resetDisconnect: true,
      connectHeaders: {
        host: '/',
        login: self.app.config.get('states.stomp.login'),
        passcode: self.app.config.get('states.stomp.password'),
        'heart-beat': '1000,1000'
      }
    }
  ]);

  self.connectionManager.on('error', function (error) {
    var connectArgs = error.connectArgs;
    var address = connectArgs.host + ':' + connectArgs.port;
    self.log.error('Could not connect to states stomp ' + address + ': ' + error.message);
  });

  self.channelPool = stompit.ChannelPool(self.connectionManager);

  async.auto({
    fileList: function (next) {
      self.plugins = {};
      if (!self.app.config.get('states.enabled')) {
        self.log.info('States processing disabled, skipping loading plugins');
        return next(null, []);
      }
      self.log.info('Loading states plugins started...');
      self.app.services.data.dirWalk(path.join(__dirname, 'plugins'), next);
    },
    plugins: ['fileList', function (next, res) {
      async.each(res.fileList, function (filePath, next) {
        if (path.extname(filePath) !== '.js') { return next(); }
        self.registerPlugin(filePath, next);
      }, next);
    }],
    reportPlugins: ['plugins', function (next) {
      if (!self.app.config.get('states.enabled')) { return next(); }
      var pluginsCount = Object.keys(self.plugins).length;
      if (pluginsCount === 0) {
        self.log.warn('States plugins loading procedure complete successfully, but plugins not found');
      } else {
        self.log.info('States plugins loaded successfully - %s', pluginsCount);
      }
      next();
    }]
  }, next);
};


StatesSvc.prototype.start = function () {
  var self = this;
  if (!self.app.config.get('states.enabled')) {
    self.app.log.info('States processing disabled, skipping queue subscribing');
  } else {
    self.log.info('Subscribing to states queue "%s"', self.app.config.get('states.stomp.destination'));

    var subscribeHeaders = {
      'destination': self.app.config.get('states.stomp.destination'),
      'ack': 'auto'
    };
    self.log.debug('Subscribe to destination "%s"', self.app.config.get('states.stomp.destination'));
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
StatesSvc.prototype.processMessage = function (message, next) {
  var self = this;

  this.app.models.states.findOne({ eventType: message.body.name, stateType: 'start', 'site._id': message.body.siteId }, function(err, start) {
    if (err) { return next(err); }
    if (!start) { return next(); }

    start.getArrayTree({
      condition: { eventType: message.body.name, 'site._id': message.body.siteId }
    }, function(err, start) {
      if (err) { return next(err); }

      self.executeState(start[0], message.body, next);
    });
  });
};

StatesSvc.prototype.executeState = function (state, args, next) {
  var self = this;

  self.log.debug('State run "%s" in event "%s"', state.stateType, args.name);
  var handlers = self.plugins[state.stateType];

  if (Array.isArray(handlers) && handlers.length > 0) {
    async.each(handlers, function (handler, next) {
      if (handler.length > 4) {
        handler({log: self.log.child({taskName: args.name})}, state, self.app, args, next);
      } else {
        handler(self.app, state, args, next);
      }
    }, function (err) {
      if (err) { return next(err); }

      self.log.debug('State "%s" in event "%s" processed successfully. Executed states - %s', state.stateType, args.name, handlers.length);

      if (!state.children || !state.children[0]) { return next(); }
      self.executeState(state.children[0], args, next);
      next();
    });
  } else {
    self.log.debug('State "%s" in event "%s" processed successfully without executing states', state.stateType, args.name);
    next();
  }
};

StatesSvc.prototype.push = function (body, next) {
  var self = this;
  self.channelPool.channel(function (err, channel) {
    if (err) { self.log.error('Send-channel error: ' + err.message); }
    var sendHeaders = {
      'destination': self.app.config.get('states.stomp.destination'),
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

StatesSvc.prototype.run = function (taskName, siteId, body, next) {
  body.name = taskName;
  body.siteId = siteId;
  this.push(body, next);
};

module.exports = StatesSvc;
