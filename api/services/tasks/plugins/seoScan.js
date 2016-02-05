'use strict';

var async = require('async'),
  mongoose = require('mongoose'),
  url = require('url'),
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
      next(null, _.map(data.task.keywords, function(keyword) {
        return keyword.keyword.replace(/\d+/g, '');
      }))
    }],
    'yandexPosition': ['task', 'keywords', 'site', function(next, data) {
      var keywords = data.keywords;
      var url = 'http://' + data.task.site.domain + data.task.url.link;

      async.mapLimit(keywords, 3, function(keyword, next) {
        app.services.yandex.getUrlPosition(data.site, url, keyword, { count: 100 }, function(err, position) {
          if (err) { return next(err); }
          var history = new app.models.seoStatHistories({
            url: {
              _id: data.task.url._id,
              link: data.task.url.link,
              collectionName: data.task.url.collectionName,
              resourceId: data.task.url.resourceId
            },
            keyword: keyword,
            metrik: 'yandex-position',
            value: position,
            site: {
              _id: data.task.site
            }
          });
          history.save(function(err) {
            if (err) { return next(err); }

            next(null, position);
          });
        });
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
      next(null, _.map(data.task.keywords, function(keyword) {
        return keyword.keyword.replace(/\d+/g, '');
      }))
    }],
    'googlePosition': ['task', 'keywords', function(next, data) {
      var keywords = data.keywords;
      var url = 'http://' + data.task.site.domain + data.task.url.link;

      async.mapLimit(keywords, 3, function(keyword, next) {
        app.services.google.getUrlPosition(url, keyword, { count: 100 }, function(err, position) {
          if (err) { return next(err); }
          var history = new app.models.seoStatHistories({
            url: {
              _id: data.task.url._id,
              link: data.task.url.link,
              collectionName: data.task.url.collectionName,
              resourceId: data.task.url.resourceId
            },
            keyword: keyword,
            metrik: 'google-position',
            value: position,
            site: {
              _id: data.task.site
            }
          });
          history.save(function(err) {
            console.info(err, '1')
            if (err) { return next(err); }

            next(null, position);
          });
        });
      }, function(err, results){
        console.info(err, '2')
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
        console.info(data.resource.seo, item)
        if (!item) {
          item = { title: keyword };
          data.resource.seo.keywords.push(item);
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