'use strict';

var nestedSet = require('../../middleware/nestedSet.js'),
  _ = require('lodash'),
  async = require('async');

function VotingModule(app) {
  this.app = app;
}

VotingModule.prototype.initModels = function () {
  this.app.models.polls = require('./models/poll.js');
};

VotingModule.prototype.initRoutes = function () {
  this.app.server.use('/api/polls', require('./routes/polls.js'));
};

module.exports = VotingModule;