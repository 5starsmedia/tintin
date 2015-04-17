'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  router = express.Router();

router.get('/import', function (req, res, next) {
  return;
  _.forEach(data, function(item) {
    var post = new req.app.models.posts();
    post.title = item.text;
    post.body = item.text;
    post.tags = [];
    post.site = req.site;
    var tags = item.tags.split(',');
    _.forEach(tags, function(tag) {
      tag = _.trim(tag);
      post.tags.push({
        title: tag
      });
    });
    post.save(function (err, data) {
    });
  });
});

router.get('/tags-complete', function (req, res, next) {
  if (req.auth.isGuest) {
    res.status(401).end();
  } else {
    req.app.models.posts.aggregate([
      {$match: {'removed': {$exists: false}}},
      {$unwind: '$tags'},
      {$match: {'tags.title': new RegExp(req.query.term, 'i')}},
      {$group: {_id: '$tags.title', count: {$sum: 1}}},
      {$sort: {count: -1}},
      {$limit: 10},
      {$project: {title: '$_id', _id: 0}}
    ], function (err, data) {
      if (err) { return next(err); }
      res.json(data);
    });
  }
});

router.get('/source-complete', function (req, res, next) {
  if (req.auth.isGuest) {
    res.status(401).end();
  } else {
    req.app.models.posts.aggregate([
      {$match: {'removed': {$exists: false}}},
      {$match: {'source': new RegExp(req.query.term, 'i')}},
      {$group: {_id: '$source', count: {$sum: 1}}},
      {$sort: {count: -1}},
      {$limit: 10},
      {$project: {title: '$_id', _id: 0}}
    ], function (err, data) {
      if (err) { return next(err); }
      res.json(_.uniq([{ title: req.query.term }].concat(data), function(n) {
        return n.title;
      }));
    });
  }
});

router.get('/:id/suggest', function (req, res, next) {
  async.auto({
    'item': function(next) {
      return req.app.models.posts.findById(req.params.id, next);
    },
    'suggest': ['item', function(next, data) {
      var keys = _.map(data.item.keywords, function (item) {
        return item.word;
      });

      req.app.models.posts.aggregate([
        { '$match' : { _id: { $ne: data.item._id }, published: true, removed: {$exists: false}, keywords: {$elemMatch: { word: {$in: keys}}} } },
        { '$unwind' : '$keywords'},
        { '$match' : { 'keywords.word': {$in: keys}} },
        { '$group' : { '_id' : '$_id', 'keywords' : { '$sum' : 1} }},
        { '$sort' : { 'keywords' : -1}},
        { '$limit' : 10}
      ], next);
    }],
    'items': ['suggest', function(next, data) {
      req.app.models.posts.find({ _id: { $in: _.pluck(data.suggest, '_id') } }, next);
    }]
  }, function (err, data) {
    if (err) { return next(err); }

    return res.json(data.items);
  });
});

module.exports = router;