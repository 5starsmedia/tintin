'use strict';

var async = require('async'),
  moment = require('moment'),
  natural = require('natural'),
  TfIdf = natural.TfIdf,
  htmlToText = require('html-to-text'),
  _ = require('lodash');

exports['posts.keywords'] = function (app, msg, cb) {
  async.auto({
    'posts': function(next) {
      app.models.posts.find({}, next);
    },
    'generateKeywords': ['posts', function(next, res) {
      _.forEach(res.posts, function(item) {
        app.services.mq.push(app, 'events', {name: 'db.posts.update', _id: item._id});
      });
      next();
    }]
  }, cb);
};

exports['db.posts.insert'] = exports['db.posts.update'] = function (app, msg, cb) {
  async.auto({
    'post': function(next) {
      app.models.posts.findById(msg.body._id, next);
    },
    'category': ['post', function(next, data) {
      app.models.categories.findById(data.post.category._id, next);
    }],
    'generateKeywords': ['post', 'category', function(next, res) {
      if (res.post.site) {
        app.services.mq.push(app, 'events', {name: 'sitemap.generate.site', _id: res.post.site._id});
      }

      var tfidf = new TfIdf();
      tfidf.addDocument(res.post.title + ' ' + htmlToText.fromString(res.post.body, { wordwrap: false, ignoreHref: true, ignoreImage: true }));

      app.log.info('Generate keywords for ' + res.post._id)
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
      res.post.category = res.category;
      res.post.save(next);
    }],
    'postsCount': ['category', function(next, data) {
      app.models.posts.count({ 'category._id': data.category._id }, next);
    }],
    'updateCount': ['postsCount', function(next, data) {
      data.category.postsCount = data.postsCount;
      data.category.save(next);
    }]
  }, cb);
};



exports['posts.deferredPublication'] = function (app, msg, cb) {
  async.auto({
    'posts': function(next) {
      app.models.posts.find({ status: 6, publishedDate: { $lt: new Date() } }, next);
    },
    'generateKeywords': ['posts', function(next, res) {

      async.eachLimit(res.posts, 5, function(item, next){
        item.createDate = item.publishedDate;
        item.status = 4;
        item.published = true;
        item.save(next);
      }, next);
    }]
  }, cb);
};