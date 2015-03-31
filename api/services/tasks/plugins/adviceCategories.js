'use strict';

var async = require('async'),
  _ = require('lodash');

exports['db.advices.insert'] = exports['db.advices.delete'] = exports['db.advices.update'] = function (app, msg, cb) {
  app.models.advices.findById(msg.body._id, 'category', function (err, advice) {
    if (err) { return cb(err); }
    app.services.mq.push(app, 'events', {name: 'stat.adviceCategories.counters', _id: advice.category._id}, cb);
  });
};

exports['db.comments.insert'] = exports['db.comments.delete'] = function (app, msg, cb) {
  app.models.comments.findById(msg.body._id, function (err, comment) {
    if (err) { return cb(err); }
    if (comment.collectionName === 'advices') {
      app.models.advices.findById(comment.resourceId, 'category', function (err, advice) {
        if (err) { return cb(err); }
        app.services.mq.push(app, 'events', {name: 'stat.adviceCategories.counters', _id: advice.category._id}, cb);
      });
    } else {
      cb();
    }
  });
};

exports['stat.adviceCategories.counters'] = function (app, msg, cb) {
  async.auto({
    adviceCategory: function (next) {
      app.models.adviceCategories.findById(msg.body._id, next);
    },
    totalAdvicesCount: ['adviceCategory', function (next, res) {
      app.models.advices.count({'category._id': res.adviceCategory._id, removed: {$exists: false}}, next);
    }],
    totalCommentsCount: ['adviceCategory', function (next, res) {
      app.models.advices.aggregate([
        {$match: {'category._id': res.adviceCategory._id, removed: {$exists: false}}},
        {$group: {_id: null, totalCommentsCount: {$sum: '$commentsCount'}}}
      ], function (err, rr) {
        if (err) { return next(err); }
        var r = _.first(rr);
        next(null, r ? r.totalCommentsCount : 0);
      });
    }],
    save: ['adviceCategory', 'totalAdvicesCount', 'totalCommentsCount', function (next, res) {
      res.adviceCategory.totalAdvicesCount = res.totalAdvicesCount;
      res.adviceCategory.totalCommentsCount = res.totalCommentsCount;
      res.adviceCategory.save(next);
    }]
  }, cb);
};
