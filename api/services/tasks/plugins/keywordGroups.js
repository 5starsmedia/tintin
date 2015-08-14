'use strict';

var _ = require('lodash'),
  async = require('async');

exports['db.posts.insert'] = function (app, msg, cb) {
  async.auto({
    'post': function (next) {
      app.models.posts.findById(msg.body._id, next);
    },
    'moderation': ['post', function (next, data) {
      if (!data.post || data.post.status != 3) {
        return next();
      }

      app.services.mq.push(app, 'events', {name: 'seo.checkTextUnique', _id: data.post._id});
      next();
    }]
  }, cb);
};