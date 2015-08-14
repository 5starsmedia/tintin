'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  request = require('request'),
  cheerio = require('cheerio'),
  router = express.Router();

function newTask(req, action, url, next) {
  var task = new req.app.models.seoTasks({
    url: {
      _id: url._id,
      link: url.link,
      collectionName: url.collectionName,
      resourceId: url.resourceId
    },
    action: action,
    status: 'new'
  });
  if (url.keywordGroup) {
    task.keywords = url.keywordGroup.keywords;
  }
  task.site = req.site;
  task.save(next);
}

router.post('/run-tasks', function (req, res, next) {
  async.auto({
    'post': function(next) {
      req.app.models[req.query.collectionName].findById(req.query.resourceId, next);
    },
    'urlModel': ['post', function(next, data) {
      if (!data.post) {
        return next(new req.app.errors.NotFoundError(req.params.id));
      }
      req.app.services.seo.getModelByResource(req.site, 'posts', data.post._id, next);
    }],
    'seoTaskYandex': ['urlModel', function(next, data) {
      newTask(req, 'get-yandex-position', data.urlModel, next);
    }],
    'seoTaskGoogle': ['urlModel', function(next, data) {
      newTask(req, 'get-google-position', data.urlModel, next);
    }]
  }, function (err, data) {
    if (err) { return next(err); }

    req.app.services.mq.push(req.app, 'events', {name: 'seo.task.' + data.seoTaskYandex[0].action, _id: data.seoTaskYandex[0]._id});
    req.app.services.mq.push(req.app, 'events', {name: 'seo.task.' + data.seoTaskGoogle[0].action, _id: data.seoTaskGoogle[0]._id});

    res.status(204).end();
  });
});


module.exports = router;