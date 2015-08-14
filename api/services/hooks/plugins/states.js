'use strict';

var _ = require('lodash'),
  async = require('async');

exports['put.states'] = function (req, data, cb) {
  async.auto({
    'state': function (next) {
      req.app.models.states.findById(data._id, next);
    },
    'saveSettings': ['state', function (next, res) {
      if (req.body.settings) {
        res.state.settings = req.body.settings;
      }
      res.state.markModified('settings');
      res.state.save(next);
    }]
  }, cb);
};

exports['afterPost.states'] = function (req, data, cb) {
  async.auto({
    'state': function (next) {
      req.app.models.states.findById(data._id, next);
    },
    'condition': ['state', function (next, res) {
      if (res.state.stateType.substring(0, 3) == 'if.') {

        var state = new req.app.models.states({eventType: res.state.eventType});
        state.stateType = 'end';
        state.title = 'End of the processing';
        state.parentId = res.state._id;
        state.site = res.state.site;
        state._w = 2;
        state.save(next);
      } else {
        next();
      }
    }]
  }, cb);
};