'use strict';

var async = require('async'),
  _ = require('lodash');

exports['db.blogs.insert'] = exports['db.blogs.update'] = function (app, msg, next) {
  async.auto({
    blog: function (next) {
      app.models.blogs.findById(msg.body._id, 'title category description', next);
    },
    files: ['blog', function (next, data) {
      app.models.files.find({collectionName: 'blogs', resourceId: data.blog._id}, function (err, files) {
        if (err) { return next(err); }
        async.each(files, function (file, next) {
          _.each(file.refs, function (ref) {
            if (ref.resourceId.toString() === data.blog._id.toString()) {
              ref.title = data.blog.title;
            }
          });
          file.save(next);
        }, next);
      });
    }],
    calc: ['blog', function (next, data) {
      if (data.blog.category && data.blog.category._id) {
        app.models.blogCategories.findById(data.blog.category._id, function (err, category) {
          if (err) { return next(err); }
          data.blog.category.title = category.title;
          data.blog.category.alias = category.alias;
          data.blog.save(next);
        });
      } else {
        next();
      }
    }],
    // indexing
    indexing: ['blog', function (next, data) {
      app.services.search.searchStrains(data.blog.title + ' ' + data.blog.description, 5, function(res) {
        data.blog.suggestedStrains = res;
        data.blog.save(next);
      });
    }]
  }, next);
};

exports['db.accounts.update'] = function (app, msg, cb) {
  app.models.accounts.findById(msg.body._id, function (err, account) {
    if (err) { return cb(err); }
    if (account.coverFile) {
      app.models.blogs.update({'account._id': account._id}, {account: account.toObject()}, {multi: true}, cb);
    } else {
      cb();
    }
  });
};
