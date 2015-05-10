'use strict';

var mongoose = require('mongoose'),
  _ = require('lodash'),
  async = require('async'),
  moment = require('moment');

function dateToString(dateStr) {
  return moment.utc(dateStr).format('YYYY-MM-DD');
}

exports['post.categories'] = function (req, data, cb) {
  req.app.services.url.aliasFor(req.app, data.title, {}, function (err, alias) {
    if (err) { return cb(err); }
    data.alias = alias;
    cb();
  });
};

exports['put.categories'] = function (req, data, cb) {
  async.auto({
    'category': function(next) {
      req.app.models.categories.findById(data._id, 'title body alias publishDate', next);
    },
    'parent': ['category', function(next) {
      req.app.models.categories.findById(data.parentId, 'title body alias publishDate', next);
    }],
    'aliasFor' : ['category', function(next, res) {
      if (res.category.alias) {
        return next();
      }
      req.app.services.url.aliasFor(req.app, data.title, {}, function (err, alias) {
        if (err) { return next(err); }
        data.alias = alias;
        next();
      });
    }],
    'updateParent': ['parent', function(next, res) {
      if (res.parent) {
        data.parentAlias = res.parent.alias;
      }
      next();
    }]
  }, cb);
};