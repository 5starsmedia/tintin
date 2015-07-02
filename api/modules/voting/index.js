'use strict';

var nestedSet = require('../../middleware/nestedSet.js');

function VotingModule(app) {
  this.app = app;
}

VotingModule.prototype.initModels = function () {
  this.app.models.polls = require('./models/poll.js');
};

VotingModule.prototype.initRoutes = function () {

  this.app.services.broadcast.on('socket:send.vote', function (data) {

    console.info(data);

  });
};

module.exports = VotingModule;