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
      app.services.mq.push(app, 'events', {name: 'seo.scan.post.yandex', _id: post._id});
      //app.services.mq.push(app, 'events', {name: 'seo.scan.post', _id: post._id});
    });
    cb();
  });
};

exports['seo.task.get-yandex-position'] = function (app, msg, cb) {
  async.auto({
    'task': function(next) {
      app.models.seoTasks.findById(msg.body._id, next);
    },
    'site': ['task', function(next, data) {
      app.models.sites.findById(data.task.site._id, next);
    }],
    'isProcess': ['task', function(next, data) {
      data.task.status = 'inprocess';
      data.task.save(next);
    }],
    'keywords': ['task', function(next, data) {
      var keywords = data.task.keywords.split("\n");
      keywords = _.map(keywords, function(keyword) {
        return keyword.replace(/\d+/g, '');
      });
      next(null, keywords)
    }],
    'yandexPosition': ['task', 'keywords', 'site', function(next, data) {
      var keywords = data.keywords;
      var url = 'http://' + data.task.site.domain + data.task.url.link;

      async.mapLimit(keywords, 3, function(keyword, next) {
        app.services.yandex.getUrlPosition(data.site, url, keyword, { count: 100 }, next);
      }, function(err, results){
        if (err) { return next(err); }

        next(null, results);
      });
    }],

    'resource': ['task', function(next, data) {
      app.models[data.task.url.collectionName].findById(data.task.url.resourceId, next);
    }],
    'updateResource': ['resource', 'keywords', 'yandexPosition', function(next, data) {
      var avg = 0, count = 0;
      data.resource.seo.lastUpdateDate = Date.now();

      _.forEach(data.keywords, function(keyword, i) {
        if (data.yandexPosition[i] >= 0) {
          avg += data.yandexPosition[i] + 1;
          count++;
        }

        var item = _.find(data.resource.seo.keywords, { title: keyword });
        if (!item) {
          item = { title: keyword };
          data.resource.seo.keywords.push(item);
          item = _.find(data.resource.seo.keywords, { title: keyword });
        }
        item.yandex = data.yandexPosition[i];
      });

      if (count) {
        data.resource.seo.google = Math.round(avg / count);
      }
      data.resource.save(next);
    }]
  }, function (err, data) {
    if (err) {
      data.task.status = 'errored';
      data.task.resultString = err.message;
      data.task.result = err;
      data.task.save(cb);
      return;
    }

    data.task.status = 'completed';
    data.task.resultString = '';
    _.forEach(data.keywords, function(keyword, n) {
      if (data.yandexPosition[n] < 0) {
        return;
      }
      data.task.resultString += keyword + ': ' + data.yandexPosition[n] + '<br/>';
    });
    if (!data.task.resultString) {
      data.task.resultString = '-';
    }
    data.task.result = data.yandexPosition;
    data.task.save(cb);
  });
};


exports['seo.task.get-google-position'] = function (app, msg, cb) {
  async.auto({
    'task': function(next) {
      app.models.seoTasks.findById(msg.body._id, next);
    },
    'isProcess': ['task', function(next, data) {
      data.task.status = 'inprocess';
      data.task.save(next);
    }],
    'keywords': ['task', function(next, data) {
      var keywords = data.task.keywords.split("\n");
      keywords = _.map(keywords, function(keyword) {
        return keyword.replace(/\d+/g, '');
      });
      next(null, keywords)
    }],
    'googlePosition': ['task', 'keywords', function(next, data) {
      var keywords = data.keywords;
      var url = 'http://' + data.task.site.domain + data.task.url.link;

      async.mapLimit(keywords, 3, function(keyword, next) {
        app.services.google.getUrlPosition(url, keyword, { count: 100 }, next);
      }, function(err, results){
        if (err) { return next(err); }

        next(null, results);
      });
    }],

    'resource': ['task', function(next, data) {
      app.models[data.task.url.collectionName].findById(data.task.url.resourceId, next);
    }],
    'updateResource': ['resource', 'keywords', 'googlePosition', function(next, data) {
      var avg = 0, count = 0;
      data.resource.seo.lastUpdateDate = Date.now();

      _.forEach(data.keywords, function(keyword, i) {
        if (data.googlePosition[i] >= 0) {
          avg += data.googlePosition[i];
          count++;
        }

        var item = _.find(data.resource.seo.keywords, { title: keyword });
        if (!item) {
          item = { title: keyword };
          data.resource.seo.keywords.push(item);
          item = _.find(data.resource.seo.keywords, { title: keyword });
        }
        item.google = data.googlePosition[i];
      });

      if (count) {
        data.resource.seo.google = Math.round(avg / count);
      }
      data.resource.save(next);
    }]
  }, function (err, data) {
    if (err) {
      data.task.status = 'errored';
      data.task.resultString = err.message;
      data.task.result = err;
      data.task.save(cb);
      return;
    }

    data.task.status = 'completed';
    data.task.resultString = '';
    _.forEach(data.keywords, function(keyword, n) {
      if (data.googlePosition[n] < 0) {
        return;
      }
      data.task.resultString += keyword + ': ' + data.googlePosition[n] + '<br/>';
    });
    if (!data.task.resultString) {
      data.task.resultString = '-';
    }
    data.task.result = data.googlePosition;
    data.task.save(cb);
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
      var avgGoogle = 0, avgYandex = 0,
        googleCount = 0, yandexCount = 0;
      data.post.seo = {
        lastUpdateDate: Date.now(),
        keywords: _.map(data.keywords, function(keyword, i) {
          if (data.googlePosition[i] >= 0) {
            avgGoogle += data.googlePosition[i] + 1;
            googleCount++;
          }
          if (data.yandexPosition[i] >= 0) {
            avgYandex += data.yandexPosition[i] + 1;
            yandexCount++;
          }
          return {
            title: keyword,
            google: data.googlePosition[i] + 1,
            yandex: data.yandexPosition[i] + 1
          };
        })
      };
      if (googleCount) {
        data.post.seo.google = Math.round(avgGoogle / googleCount);
      }
      if (yandexCount) {
        data.post.seo.yandex = Math.round(avgYandex / yandexCount);
      }
      data.post.save(next);
    }]
  }, cb);
};