'use strict';

var
  util = require('util'),
  events = require('events'),
  stompit = require('stompit');

function BroadcastSvc(app) {
  events.EventEmitter.call(this);
  this.app = app;
  this.log = app.log.child({module: 'BroadcastSvc'});
}

util.inherits(BroadcastSvc, events.EventEmitter);

BroadcastSvc.prototype.init = function (next) {
  var self = this;
  self.connectionManager = new stompit.ConnectFailover([
    {
      host: self.app.config.get('broadcast.stomp.host'),
      port: self.app.config.get('broadcast.stomp.port'),
      resetDisconnect: true,
      connectHeaders: {
        host: '/',
        login: self.app.config.get('broadcast.stomp.login'),
        passcode: self.app.config.get('broadcast.stomp.password'),
        'heart-beat': '1000,1000'
      }
    }
  ]);

  self.connectionManager.on('error', function (error) {
    var connectArgs = error.connectArgs;
    var address = connectArgs.host + ':' + connectArgs.port;
    self.log.error('Could not connect to broadcast stomp ' + address + ': ' + error.message);
  });

  self.connectionManager.on('connecting', function (connector) {
    //self.log.debug('Connecting to broadcast stomp ' + connector.serverProperties.remoteAddress.transportPath);
  });
  self.channelPool = stompit.ChannelPool(self.connectionManager);

  self.channelPool.channel(function (err, channel) {
    if (err) { return self.log.error('Broadcast channel error', err.message); }
    var subscribeHeaders = {
      'destination': self.app.config.get('broadcast.stomp.destination'),
      'ack': 'auto'
    };
    channel.subscribe(subscribeHeaders, function (err, message) {
      if (err) {
        return self.log.error('Broadcast subscribe error', err.message);
      }
      message.readString('utf-8', function (err, body) {
        if (err) { return self.log.error('Message read error', err.message); }
        message.ack();
        var m = JSON.parse(body);
        self.emit(m.name, m.data || {});
      });
    });
  });
  next();
};

BroadcastSvc.prototype.publish = function (name, data) {
  var self = this;
  self.channelPool.channel(function (err, channel) {
    if (err) { self.log.error('Broadcast send-channel error: ' + err.message); }
    var sendHeaders = {
      'destination': self.app.config.get('broadcast.stomp.destination'),
      'content-type': 'application/json'
    };
    channel.send(sendHeaders, JSON.stringify({name: name, data: data}), function (err) {
      if (err) {
        return self.log.error('Broadcast send error: ' + err.message);
      }
      if (typeof next === 'function') { next(); }
    });
  });
};

module.exports = BroadcastSvc;
