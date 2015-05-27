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

router.get('/month', function (req, res, next) {
  var startDate = moment().subtract(1, 'month');

  async.auto({
    'post': function(next) {
      req.app.models[req.query.collectionName].findById(req.query.resourceId, next);
    },
    'urlModel': ['post', function(next, data) {
      if (!data.post) {
        return next(new req.app.errors.NotFoundError(req.params.id));
      }
      next();
    }],
    'aggregateGoogle': ['urlModel', function(next, data) {
      req.app.models.seoStatHistories.aggregate([
        {$match: {'metrik': 'google-position', 'url.collectionName': req.query.collectionName, 'url.resourceId': req.query.resourceId, createDate: {$gte: startDate.toDate()}}},
        { $project: { day: { $dayOfMonth: "$createDate" }, month: { $month: "$createDate" }, value: '$value', keyword: '$keyword' } },
        { $group: {_id: {keyword: '$keyword', day:'$day', month: '$month'}, points: {$avg: '$value'}, month: {$min:'$month'} } }
      ], next);
    }],
    'aggregateYandex': ['urlModel', function(next, data) {
      req.app.models.seoStatHistories.aggregate([
        {$match: {'metrik': 'yandex-position', 'url.collectionName': req.query.collectionName, 'url.resourceId': req.query.resourceId, createDate: {$gte: startDate.toDate()}}},
        { $project: { day: { $dayOfMonth: "$createDate" }, month: { $month: "$createDate" }, value: '$value', keyword: '$keyword' } },
        { $group: {_id: {keyword: '$keyword', day:'$day', month: '$month'}, points: {$avg: '$value'}, month: {$min:'$month'} } }
      ], next);
    }]
  }, function (err, data) {
    if (err) { return next(err); }

    res.json({
      google: data.aggregateGoogle,
      yandex: data.aggregateYandex
    });
  });
});


module.exports = router;