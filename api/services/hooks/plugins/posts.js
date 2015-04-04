'use strict';

var mongoose = require('mongoose'),
  _ = require('lodash'),
  moment = require('moment');

function dateToString(dateStr) {
  return moment.utc(dateStr).format('YYYY-MM-DD');
}

exports['post.posts'] = function (req, data, cb) {
  if (data.status == 4) {
    data.published = true;
  }

  data['account._id'] = req.auth.account._id;
  data['account.title'] = req.auth.account.title;
  data['account.coverFile'] = req.auth.account.coverFile;

  if (req.auth.account.imageUrl) {
    data['account.imageUrl'] = req.auth.account.imageUrl;
  }
  data.alias = mongoose.Types.ObjectId().toString();
  if (data.published) {
    data.publishDate = new Date();
    data.publishDateStr = dateToString(data.publishDate);
  } else {
    data.publishDate = null;
    data.publishDateStr = null;
  }

  req.app.services.html.clearHtml(data.body, function (err, text) {
    if (err) { return cb(err); }
    data.body = text;
    req.app.services.url.aliasFor(req.app, data.title, {}, function (err, alias) {
      if (err) { return cb(err); }
      data.alias = alias;
      cb();
    });
  });
  //cb();
};

exports['put.posts'] = function (req, data, cb) {
  if (data.status == 4) {
    data.published = true;
  }

  req.app.models.posts.findById(data._id, 'publishDate', function (err, blog) {
    if (err) { return cb(err); }
    if (data.published) {
      data.publishDate = blog.publishDate || new Date();
      data.publishDateStr = dateToString(data.publishDate);
    }
    req.app.services.html.clearHtml(data.body, function (err, text) {
      if (err) { return cb(err); }
      data.body = text;
      req.app.services.url.aliasFor(req.app, data.title, {}, function (err, alias) {
        if (err) { return cb(err); }
        data.alias = alias;
        cb();
      });
    });
  });
  //cb();
};

exports['put.posts.tags'] = function (req, data, next) {
  if (data.tags) {
    _.each(data.tags, function (tag) {
      if (tag.title) {
        tag.title = tag.title.toLowerCase();
      }
    });
  }
  next();
};
