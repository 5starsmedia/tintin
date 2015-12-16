'use strict';

var mongoose = require('mongoose'),
  _ = require('lodash'),
  async = require('async'),
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
  async.auto({
    'post': function(next) {
      req.app.models.posts.findById(data._id, next);
    },
    'category': ['post', function(next) {
      req.app.models.categories.findById(data['category._id'], 'title alias parentAlias', next);
    }],
    'account': ['post', function(next, res) {
      if (!res.post.account) {
        res.post.account = req.auth.account;
      }
      req.app.models.accounts.findById(data['account._id'] || res.post.account._id, 'title coverFile imageUrl', next);
    }],
    /*'clearHtml' : ['post', function(next, res) {
      req.app.services.html.clearHtml(data.body, function (err, text) {
        if (err) { return next(err); }
        data.body = text;
        next();
      });
    }],*/
    'aliasFor' : ['post', 'checkAliasChanged', function(next, res) {
      if (res.post.alias) {
        return next();
      }
      req.app.services.url.aliasFor(req.app, data.title, {}, function (err, alias) {
        if (err) { return next(err); }
        data.alias = alias;
        next();
      });
    }],
    'checkAliasChanged': ['post', 'category', function(next, res) {
      if (res.post.alias == data.alias) {
        return next();
      }
      var urlFrom = req.site.url + req.app.services.url.urlFor('posts', res.post);

      var newItem = res.post;
      if (res.category) {
        newItem.category = res.category;
      }
      newItem.alias = data.alias;
      var urlTo = req.site.url + req.app.services.url.urlFor('posts', newItem);
      var item = new req.app.models.redirects({
        urlFrom: urlFrom,
        urlTo: urlTo,
        code: 301,
        site: {
          _id: req.site._id
        }
      });
      item.save(function() {
        req.app.models.redirects.update({ urlTo: urlFrom }, { $set: { urlTo: urlTo } }, next);
      });
    }],
    'updateInfo': ['post', 'category', 'account', function(next, res) {
      if (data.status == 4) {
        data.published = true;
      }
      if (res.account) {
        data['account._id'] = res.account._id;
        data['account.title'] = res.account.title;
        data['account.coverFile'] = res.account.coverFile;

        if (res.account.imageUrl) {
          data['account.imageUrl'] = res.account.imageUrl;
        }
      }

      if (res.category) {
        if (res.category.alias) {
          data['category.alias'] = res.category.alias;
        }
        if (res.category.parentAlias) {
          data['category.parentAlias'] = res.category.parentAlias;
        }
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
