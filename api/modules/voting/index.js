'use strict';

var nestedSet = require('../../middleware/nestedSet.js');

function VotingModule(app) {
  this.app = app;
}

VotingModule.prototype.initModels = function () {
  this.app.models.polls = require('./models/poll.js');
};

VotingModule.prototype.initRoutes = function () {
};

module.exports = VotingModule;