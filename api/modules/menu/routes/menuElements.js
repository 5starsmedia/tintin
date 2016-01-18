'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  router = express.Router();

function buildQuery(req, query, opts) {
  if (opts.fields) {
    _.forEach(opts.fields, function(field) {
      if (req.query[field]) {
        query[field] = req.query[field];
      }
    });
  }
  return query;
}

router.get('/:id/tree', function (req, res, next) {

  async.auto({
    'root': function(cb) {
      if (req.params.id != 'footerMenu' && req.params.id != 'mainMenu') {
        return next();
      }
      return req.app.models.menuElements.findOne({ 'site._id': req.site._id, 'menuType': req.params.id, removed: { $exists: false } }, cb);
    },
    'tree': ['root', function(next, data) {
      if (!data.root) {
        return next(new req.app.errors.NotFoundError('Not found'));
      }
      data.root.getArrayTree({
        condition: buildQuery(req, {
          'site._id': req.site._id,
          removed: {$exists: false}
        }, {})
      }, function(err, tree) {
        if (err) return next(err);
        next(undefined, tree[0]);
      });
    }]
  }, function(err, data){
    if (err) return next(err);

    sortChildren(data.tree);
    res.json(data.tree);
  });

});

module.exports = router;