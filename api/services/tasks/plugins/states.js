'use strict';

var akismet = require('akismet'),
  _ = require('lodash'),
  async = require('async');

exports['db.comments.insert'] = function (app, msg, cb) {
  app.models.comments.findById(msg.body._id, function(err, comment) {
    if (err) {return next(err); }

    app.services.states.run('comment.add', comment.site._id, { _id: comment._id });
    cb();
  });
};