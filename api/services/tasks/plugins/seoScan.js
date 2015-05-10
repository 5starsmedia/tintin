'use strict';

var async = require('async'),
  mongoose = require('mongoose'),
  url = require('url'),
  cheerio = require('cheerio'),
  moment = require('moment'),
  request = require('request'),
  _ = require('lodash');

exports['seo.scan'] = function (app, msg, cb) {
  app.models.posts.find({ 'keywordGroup._id': { $exists: true } }, '_id', function(err, posts) {
    if (err) { return cb(err); }

    _.forEach(posts, function (post) {
      app.services.mq.push(app, 'events', {name: 'seo.scan.post', _id: post._id});
    });
    cb();
  });
};


exports['seo.scan.post'] = function (app, msg, cb) {
  async.auto({
    'post': function(next) {
      app.models.posts.findById(msg.body._id, next);
    },
    'postUrl': ['post', function(next, data) {
      var url = app.services.url.urlFor('posts', data.post);
      next(null, url);
    }],
    'keywordGroup': ['post', 'postUrl', function(next, data) {
      app.models.keywordGroups.findById(data.post.keywordGroup._id, next);
    }],
    'keywords': ['keywordGroup', function(next, data) {
      var keywords = data.keywordGroup.keywords.split("\n");
      keywords = _.map(keywords, function(keyword) {
        return keyword.replace(/\d+/g, '');
      });
      next(null, keywords)
    }],
    'googlePosition': ['post', 'keywords', function(next, data) {
      var keywords = data.keywords;

      var url = data.postUrl;
      console.info(url)
      async.mapLimit(keywords, 3, function(keyword, next) {
        app.services.google.getUrlPosition(url, keyword, { count: 100 }, next);
      }, function(err, results){
        if (err) { return next(err); }

        next(null, results);
      });
    }],
    'yandexPosition': ['post', 'keywordGroup', function(next, data) {
      var keywords = data.keywordGroup.keywords.split("\n");

      var url = data.postUrl;
      console.info(url)
      async.mapLimit(keywords, 3, function(keyword, next) {
        app.services.yandex.getUrlPosition(url, keyword, { count: 100 }, next);
      }, function(err, results){
        if (err) { return next(err); }

        next(null, results);
      });
    }],
    'updatePost': ['post', 'keywords', 'googlePosition', 'yandexPosition', function(next, data) {
      var avgGoogle = 0, avgYandex = 0;
      data.post.seo = {
        lastUpdateDate: Date.now(),
        keywords: _.map(data.keywords, function(keyword, i) {
          avgGoogle += data.googlePosition[i] + 1;
          avgYandex += data.yandexPosition[i] + 1;
          return {
            title: keyword,
            google: data.googlePosition[i] + 1,
            yandex: data.yandexPosition[i] + 1
          };
        })
      };
      data.post.seo.google = Math.round(avgGoogle / data.keywords.length);
      data.post.seo.yandex = Math.round(avgYandex / data.keywords.length);
      data.post.save(next);
    }]
  }, cb);
};