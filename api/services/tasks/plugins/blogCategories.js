'use strict';

var async = require('async'),
  _ = require('lodash');

exports['db.blogs.insert'] = exports['db.blogs.delete'] = exports['db.blogs.update'] = function (app, msg, cb) {
  app.models.blogs.findById(msg.body._id, 'category', function (err, blog) {
    if (err) { return cb(err); }
    app.models.blogs.aggregate([
      {
        $match: {
          'category._id': blog.category._id,
          'tags.title': {$exists: true},
          published: true,
          removed: {$exists: false}
        }
      },
      {$unwind: '$tags'},
      {$group: {_id: '$tags.title', count: {$sum: 1}}},
      {$sort: {count: -1}},
      {$limit: 10},
      {$project: {title: '$_id', count: 1, _id: 0}}
    ], function (err, tags) {
      if (err) { return cb(err); }
      app.models.blogCategories.findById(blog.category._id, function (err, category) {
        if (err) { return cb(err); }
        category.tags = tags;
        category.save(function (err) {
          if (err) { return cb(err); }
          app.services.mq.push(app, 'events', {name: 'stat.blogCategories.counters', _id: blog.category._id}, cb);
        });
      });
    });
  });
};

exports['db.comments.insert'] = exports['db.comments.delete'] = function (app, msg, cb) {
  app.models.comments.findById(msg.body._id, function (err, comment) {
    if (err) { return cb(err); }
    if (comment.collectionName === 'blogs') {
      app.models.blogs.findById(comment.resourceId, 'category', function (err, blog) {
        if (err) { return cb(err); }
        app.services.mq.push(app, 'events', {name: 'stat.blogCategories.counters', _id: blog.category._id}, cb);
      });
    } else {
      cb();
    }
  });
};

exports['stat.blogCategories.counters'] = function (app, msg, cb) {
  async.auto({
    blogCategory: function (next) {
      app.models.blogCategories.findById(msg.body._id, next);
    },
    totalBlogsCount: ['blogCategory', function (next, res) {
      app.models.blogs.count({
        'category._id': res.blogCategory._id,
        'published': true,
        'removed': {$exists: false}
      }, next);
    }],
    totalCommentsCount: ['blogCategory', function (next, res) {
      app.models.blogs.aggregate([
        {$match: {'category._id': res.blogCategory._id, 'published': true, removed: {$exists: false}}},
        {$group: {_id: null, totalCommentsCount: {$sum: '$commentsCount'}}}
      ], function (err, rr) {
        if (err) { return next(err); }
        var r = _.first(rr);
        next(null, r ? r.totalCommentsCount : 0);
      });
    }],
    save: ['blogCategory', 'totalBlogsCount', 'totalCommentsCount', function (next, res) {
      res.blogCategory.totalBlogsCount = res.totalBlogsCount;
      res.blogCategory.totalCommentsCount = res.totalCommentsCount;
      res.blogCategory.save(next);
    }]
  }, cb);
};
