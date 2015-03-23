'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  router = express.Router();

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

module.exports = router;