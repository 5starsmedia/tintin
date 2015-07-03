'use strict';

var nestedSet = require('../../middleware/nestedSet.js');

function VotingModule(app) {
  this.app = app;
}

VotingModule.prototype.initModels = function () {
  this.app.models.polls = require('./models/poll.js');
};

VotingModule.prototype.initRoutes = function () {

  var self = this;
  this.app.services.broadcast.on('socket:send.vote', function (data) {

    console.info(data);

    async.auto({
      'poll': function (next) {
        self.app.models.polls.findById(msg.body._id, next);
      }
    }, function (err, res) {
      if (err) { return cb(err); }
      res.account.save(cb);
    });

  });
};

module.exports = VotingModule;