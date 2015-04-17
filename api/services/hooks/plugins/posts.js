'use strict';

var mongoose = require('mongoose'),
  _ = require('lodash'),
  async = require('async'),
  natural = require('natural'),
  TfIdf = natural.TfIdf,
  moment = require('moment');

function dateToString(dateStr) {
  return moment.utc(dateStr).format('YYYY-MM-DD');
}
function stripTags(str){
  return str.replace(/<[^>]+>/gi, ' ');
};

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
  async.auto({
    'post': function(next) {
      req.app.models.posts.findById(data._id, 'title body alias publishDate', next);
    },
    /*'clearHtml' : ['post', function(next, res) {
      req.app.services.html.clearHtml(data.body, function (err, text) {
        if (err) { return next(err); }
        data.body = text;
        next();
      });
    }],*/
    'aliasFor' : ['post', function(next, res) {
      if (res.post.alias) {
        return next();
      }
      req.app.services.url.aliasFor(req.app, data.title, {}, function (err, alias) {
        if (err) { return next(err); }
        data.alias = alias;
        next();
      });
    }],
    'generateKeywords': ['post', function(next, res) {
      var tfidf = new TfIdf();
      console.info(res.post)
      tfidf.addDocument(res.post.title + ' ' + stripTags(res.post.body));

      res.post.keywords = [];
      tfidf.listTerms(0).forEach(function(item) {
        if (res.post.keywords.length >= 10) {
          return;
        }
        res.post.keywords.push({
          word: item.term,
          importance: item.tfidf
        });
      });
      res.post.save(next);
    }],
    'updateInfo': ['post', function(next, res) {
      if (data.status == 4) {
        data.published = true;
      }
      if (data.published) {
        data.publishDate = res.post.publishDate || new Date();
        data.publishDateStr = dateToString(data.publishDate);
      }
      next();
    }]
  }, cb);
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
