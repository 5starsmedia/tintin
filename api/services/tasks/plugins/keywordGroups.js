'use strict';

var _ = require('lodash'),
  async = require('async');

exports['db.keywordGroups.update'] = function (app, msg, cb) {
  async.auto({
    'group': function (next) {
      app.models.keywordGroups.findById(msg.body._id, next);
    },
    'text': function(next) {
      app.services.data.getResource('tz', next)
    },
    'checkText': ['group', 'text', function (next, data) {
      if (!data.group.result.text) {
        data.group.result.text = data.text['default-tz-text'];
      }
      data.group.save(next);
    }]
  }, cb);
};