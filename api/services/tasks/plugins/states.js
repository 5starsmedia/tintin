'use strict';

var _ = require('lodash'),
  async = require('async');

exports['db.comments.insert'] = function (app, msg, cb) {
  app.models.comments.findById(msg.body._id, function(err, comment) {
    if (err) {return next(err); }

    app.services.states.run('comment.add', comment.site._id, { _id: comment._id });
    cb();
  });
};

exports['db.feedbacks.insert'] = function (app, msg, cb) {
  app.models.feedbacks.findById(msg.body._id, function(err, feedback) {
    if (err) {return next(err); }
console.info('contacts.feedback')
    app.services.states.run('contacts.feedback', feedback.site._id, { _id: feedback._id });
    cb();
  });
};