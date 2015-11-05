'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  router = express.Router();

/**
 * @api {get} /api/posts Получить список постов
 * @apiName posts
 * @apiGroup posts
 * @apiVersion 0.0.1
 */

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

router.get('/csv', function (req, res, next) {
  async.auto({
    'posts': function (next) {
      var params = { 'site._id': req.site._id, removed: { $exists: false }, status: 4 };
      if (req.query.postType) {
        params.postType = req.query.postType;
      }
      req.app.models.posts.find(req.params.id, next)
    }
  }, function (err, data) {
    if (err) { return next(err); }

    res.set('Content-Type', 'text/csv');
    res.attachment(
        'posts-' + req.site.domain + '.csv'
    );

    var str = 'Title,Url,Category,Views,Meta title\n';
    var posts = _.sortBy(data.posts, 'title');
    _.each(posts, function(post) {
      str += post.title + ',' +
          req.site + req.app.services.url.urlFor('posts', post) + ',' +
          (post.category.title || '') + ',' +
          post.viewsCount + ',' +
          post.meta.title + '\n';
    });
    res.send(str);
  });

});

/**
 * @api {get} /api/posts/tags-complete?term=:term Автокомплит тегов
 * @apiName tags-complete
 * @apiGroup posts
 * @apiVersion 0.0.1
 *
 * @apiParam {String} [term] Строка поиска
 */
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

router.get('/statistic', function (req, res, next) {
  if (req.auth.isGuest) {
    res.status(401).end();
  } else {

    var startDate = new Date(),
      endDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 59);

    var days = {
      today: {
        start: startDate,
        end: endDate
      },
      yesterday: {
        start: moment(startDate).subtract(1, 'days').toDate(),
        end: moment(endDate).subtract(1, 'days').toDate()
      },
      month: {
        start: moment(startDate).startOf('month').toDate(),
        end: moment(endDate).endOf('month').toDate()
      },
      prevMonth: {
        start: moment(startDate).subtract(1, 'month').startOf('month').toDate(),
        end: moment(endDate).subtract(1, 'month').endOf('month').toDate()
      },
      all: {}
    }, result = {};

    async.forEachOf(days, function (value, key, next) {
      var match = {
        'site._id': req.site._id, removed: {$exists: false}
      };

      if (value.start) {
        match.createDate = { $gte: value.start, $lt: value.end }
      }

      req.app.models.posts.aggregate([
        { '$match' : match },
        { '$group' : { '_id' : { createdBy: '$createdBy' }, 'count' : { '$sum' : 1 } }}
      ], function(err, data) {
        if (err) { return next(err); }

        _.forEach(data, function(item) {
          var account = item._id.createdBy;
          if (!account || !account._id) {
            return;
          }
          result[account._id] = result[account._id] || {
            account: account
          };
          result[account._id][key] = item.count;
        });
        next();
      });

    }, function (err, data) {
      if (err) { return next(err); }

      return res.json(result);
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
        { '$match' : { _id: { $ne: data.item._id }, 'site._id': req.site._id, published: true, removed: {$exists: false}, keywords: {$elemMatch: { word: {$in: keys}}} } },
        { '$unwind' : '$keywords'},
        { '$match' : { 'keywords.word': {$in: keys}} },
        { '$group' : { '_id' : '$_id', 'keywords' : { '$sum' : 1} }},
        { '$sort' : { 'keywords' : -1}},
        { '$limit' : 10}
      ], next);
    }],
    'items': ['suggest', function(next, data) {
      req.app.models.posts.find({ _id: { $in: _.pluck(data.suggest, '_id') } }, 'title alias category coverFile', { limit: 5 }, next);
    }]
  }, function (err, data) {
    if (err) { return next(err); }

    return res.json(data.items);
  });
});

module.exports = router;