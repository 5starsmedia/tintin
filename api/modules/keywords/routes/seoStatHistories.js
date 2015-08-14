'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  request = require('request'),
  mongoose = require('mongoose'),
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
        {
          $match: {
            'metrik': 'google-position',
            'url.collectionName': req.query.collectionName,
            'url.resourceId': new mongoose.Types.ObjectId(req.query.resourceId)
          }
        },
        { $project: { day: { $dayOfMonth: "$createDate" }, month: { $month: "$createDate" }, year: { $year: "$createDate" }, value: '$value', keyword: '$keyword' } },
        { $group: {_id: {keyword: '$keyword', day:'$day', month: '$month', year: '$year'}, position: {$max: '$value'} } }
      ], next);
    }],
    'aggregateYandex': ['urlModel', function(next, data) {
      req.app.models.seoStatHistories.aggregate([
        {
          $match: {
            'metrik': 'yandex-position',
            'url.collectionName': req.query.collectionName,
            'url.resourceId': new mongoose.Types.ObjectId(req.query.resourceId)
          }
        },
        { $project: { day: { $dayOfMonth: "$createDate" }, month: { $month: "$createDate" }, year: { $year: "$createDate" }, value: '$value', keyword: '$keyword' } },
        { $group: {_id: {keyword: '$keyword', day:'$day', month: '$month', year: '$year'}, position: {$max: '$value'} } }
      ], next);
    }]
  }, function (err, data) {
    if (err) { return next(err); }

    var gData = {};
    _.forEach(data.aggregateGoogle, function(item) {
      var date = new Date(item._id.year, item._id.month - 1, item._id.day, 12, 0, 0);
      gData[item._id.keyword] = gData[item._id.keyword] || [];
      gData[item._id.keyword].push([date.getTime(), (item.position < 1 ? 100 : item.position)]);
    });

    var yData = {};
    _.forEach(data.aggregateYandex, function(item) {
      var date = new Date(item._id.year, item._id.month - 1, item._id.day, 12, 0, 0);
      yData[item._id.keyword] = yData[item._id.keyword] || [];
      yData[item._id.keyword].push([date.getTime(), (item.position < 1 ? 100 : item.position)]);
    });

    //res.json({"google":[{"label":"как настроить вай фай на андроид планшете    ","data":[[1432915200000,19],[1432742400000,19]]},{"label":"настроить wifi на планшете android    ","data":[[1432915200000,18],[1432742400000,19]]},{"label":"настроить вай фай на планшете андроид    ","data":[[1432915200000,22],[1432742400000,21]]},{"label":"настройка вай фай на планшете андроид    ","data":[[1432915200000,22],[1432742400000,22]]},{"label":"как настроить wifi на планшете андроид    ","data":[[1432915200000,16],[1432742400000,18]]}],"yandex":[{"label":"как настроить вай фай на андроид планшете    ","data":[[1432915200000,1],[1432742400000,1]]},{"label":"настроить wifi на планшете android    ","data":[[1432915200000,4],[1432742400000,4]]},{"label":"настроить вай фай на планшете андроид    ","data":[[1432915200000,10],[1432742400000,10]]},{"label":"настройка вай фай на планшете андроид    ","data":[[1432915200000,6],[1432742400000,7]]},{"label":"как настроить wifi на планшете андроид    ","data":[[1432915200000,7],[1432742400000,7]]}]});return;
    res.json({
      google: _.map(gData, function(item, key) {
        return {
          label: key,
          data: item
        }
      }),
      yandex: _.map(yData, function(item, key) {
        return {
          label: key,
          data: item
        }
      })
    });
  });
});


module.exports = router;