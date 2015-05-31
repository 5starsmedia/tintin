'use strict';

var _ = require('lodash'),
  util = require('util'),
  socketIO = require('socket.io'),
  jwt = require('jsonwebtoken'),
  events = require('events'),
  config = require('../../config.js');

function SocketSvc(app) {
  events.EventEmitter.call(this);
  this.app = app;
  this.log = app.log.child({module: 'SocketSvc'});
  this.sockets = {};
}

util.inherits(SocketSvc, events.EventEmitter);

SocketSvc.prototype.addSocket = function (socket) {
  var self = this;
  var id = socket.account._id.toString();
  self.sockets[id] = self.sockets[id] || [];
  self.sockets[id].push(socket);
  var stat = self.getSocketsStat();
  self.log.debug('Connected', stat.totalSockets, 'sockets from', stat.totalAccounts, 'accounts');
};

SocketSvc.prototype.sendToAccount = function (accountId, event, data) {
  var self = this;
  self.app.services.broadcast.publish('socket.message', {account: {_id: accountId}, event: event, data: data || {}});
};

SocketSvc.prototype.removeSocket = function (socket) {
  var self = this;
  if (self.sockets[socket.account._id.toString()]) {
    var index = self.sockets[socket.account._id.toString()].indexOf(socket);
    if (index > -1) {
      self.sockets[socket.account._id.toString()].splice(index, 1);
      if (self.sockets[socket.account._id.toString()].length === 0) {
        delete self.sockets[socket.account._id.toString()];
      }
    }
  }
  var stat = self.getSocketsStat();
  self.log.debug('Connected', stat.totalSockets, 'sockets from', stat.totalAccounts, 'accounts');
};

SocketSvc.prototype.getSocketsStat = function () {
  var self = this;
  return _.reduce(self.sockets, function (stat, acc) {
    stat.totalAccounts += 1;
    stat.totalSockets += acc.length || 0;
    return stat;
  }, {totalAccounts: 0, totalSockets: 0});
};

SocketSvc.prototype.init = function (next) {
  var self = this;
  self.log.info('Initializing socket service...');
  self.io = socketIO(this.app.httpServer, {});
  self.io.use(function (socket, next) {
    var handshake = socket.request;
    if (typeof handshake._query === 'undefined' || typeof handshake._query.token === 'undefined' || !handshake._query.token.length) {
      self.log.info('Unauthorized socket connection');
      return next(null, new Error('unauthorized'));
    }
    var payload = jwt.decode(handshake._query.token, config.get('auth.tokenSecret'));
    if (!payload) {
      self.log.info('Unauthorized socket connection');
      return next(null, new Error('unauthorized'));
    }
    var accountQuery = { '_id': payload._id, removed: { $exists: false } };
    self.app.models.accounts.findOne(accountQuery, 'username title roles activityDate', function (err, account) {
      if (err) { return next(err); }
      if (!account) {
        self.log.info('Unauthorized socket connection (invalid token)');
        return next(null, new Error('unauthorized'));
      }
      socket.account = account.toObject();
      socket.app = self.app;
      if (!account.activityDate || Date.now() - account.activityDate.getTime() > 5 * 60 * 1000) {
        self.log.debug('Updating activity date ', account.login);
        account.activityDate = Date.now();
        account.save(function (err) {
          if (err) { self.log.error(err); }
        });
      }

      self.addSocket(socket);
      socket.on('disconnect', function () {
        self.removeSocket(socket);
      });
      next();
    });
  });
  self.io.on('connection', function (socket) {
    var name = socket.account && socket.account.username ? socket.account.username : 'anonymous';
    self.log.info('Socket connection from "%s" started', name);
    socket.on('disconnect', function () {
      self.log.info('Socket connection from "%s" closed', name);
    });
  });
  self.log.info('Socket service initialized successfully');
  self.app.services.broadcast.on('socket.message', function (data) {
    var sockets = self.sockets[data.account._id.toString()];
    if (sockets && sockets.length > 0) {
      self.log.debug('Sending event "' + data.event + '" to account ' + data.account._id + ' sockets - ' + sockets.length);
      _.each(sockets, function (socket) {
        if (typeof socket !== 'undefined' && typeof socket.emit === 'function') {
          socket.emit(data.event, data.data);
        }
      });
    }
  });
  next();
};

module.exports = SocketSvc;