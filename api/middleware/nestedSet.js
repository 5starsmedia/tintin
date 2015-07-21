'use strict';

var express = require('express'),
  mongoose = require('mongoose'),
  buffer = require('buffer'),
  pwd = require('pwd'),
  _ = require('lodash'),
  jwt = require('jsonwebtoken'),
  crypto = require('crypto'),
  request = require('request'),
  querystring = require('querystring'),
  async = require('async'),
  S = require('string'),
  config = require('../config.js');

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

function getRoot(req, collectionName, opts, callback) {
  req.app.models[collectionName].findOne(buildQuery(req, { 'site._id': req.site._id, parentId: null }, opts), function(err, node) {
    if (err) return callback(err);

    if (!node) {
      node = new req.app.models[collectionName](buildQuery(req, { lft: 1, rgt: 2 }, opts));
      node.title = 'root';
      node.site = {
        _id: req.site._id
      };
      node.save(function(err) {
        if (err) return callback(err);
        callback(undefined, node);
      });
      return;
    }
    callback(undefined, node);
  });
}

function sortChildren(node) {
  node.children = node.children || [];
  node.children = _.sortBy(node.children || [], '_w');
  _.map(node.children, sortChildren);
  return node.children;
}

function processGet(collectionName, opts, req, res, next) {

  async.auto({
    'root': function(next) {
      if (req.params.id) {
        req.app.models[collectionName].findById(new mongoose.Types.ObjectId(req.params.id), next);
      } else {
        getRoot(req, collectionName, opts, next);
      }
    },
    'tree': ['root', function(next, data) {
      data.root.getArrayTree({
        condition: buildQuery(req, {
          'site._id': req.site._id,
          removed: {$exists: false}
        }, opts)
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

};

function processPost(collectionName, opts, req, res, next) {
  async.auto({
    'before': function(next) {
      if (!req.query.before) {
        return next();
      }
      req.app.models[collectionName].findById(new mongoose.Types.ObjectId(req.params.id), next);
    },
    'parent': ['before', function(next, data) {
      if (data.before) {
        req.app.models[collectionName].findById(new mongoose.Types.ObjectId(data.before.parentId), next);
      } else {
        req.app.models[collectionName].findById(new mongoose.Types.ObjectId(req.params.id), next);
      }
    }],
    'childrens': ['parent', function(next, data) {
      if (!data.parent) {
        return next(req.app.errors.NotFoundError('Node "' + req.params.id + '" not found.'));
      }
      data.parent.getChildren(next);
    }],
    'position': ['parent', 'childrens', 'before', function(next, data) {
      if (data.before) {
        return next(null, data.before._w);
      }
      if (req.query.insert) {
        req.app.models[collectionName].collection.update(buildQuery(req, { parentId: data.parent._id }, opts), { $inc: { _w: 1 } }, { multi: true }, function(err, data) {
          if (err) return next(err);

          return next(undefined, 1);
        });
        return;
      }

      next(undefined, data.childrens.length + 1)
    }],
    'insertChildren': ['position', function(next, data) {
      delete req.body._id;
      var node = new req.app.models[collectionName](req.body);
      node._w = data.position;
      node.parentId = data.parent._id;
      node.title = req.body.title || 'New node';

      if (req.app.models[collectionName].schema.paths['site._id']) {
        node.site = {
          _id: req.site._id,
          domain: req.site.domain
        };
      }
      node.save(next);
    }],
    'hooks': ['insertChildren', function(next, data) {
      req.app.services.hooks.hook(req, 'afterPost.' + collectionName, data.insertChildren[0], next);
    }],
    'tasks': ['insertChildren', function(next, data) {
      req.app.services.mq.push(req.app, 'events', {
        name: 'db.' + collectionName + '.insert',
        _id: data.insertChildren[0]._id
      }, next);
    }],
    'updateBefore': ['before', 'insertChildren', function(next, data) {
      if (!data.before) {
        return next();
      }
      data.before.parentId = data.insertChildren[0]._id;
      data.before.save(next);
    }]
  }, function(err, data){
    if (err) return next(err);

    res.json(data.insertChildren[0]);
  });

}

function processPut(collectionName, opts, req, res, next) {

  async.auto({
    'element': function(next) {
      req.app.models[collectionName].findById(new mongoose.Types.ObjectId(req.params.id), next);
    },
    'changePosition': ['element', function(next, data) {
      if (!data.element) {
        return next(req.app.errors.NotFoundError('Node "' + req.params.id + '" not found.'));
      }
      if (!req.query.position) {
        return next();
      }
      // remove after on old position
      req.app.models[collectionName].collection.update(buildQuery(req, {
        _id: { $ne: data.element._id },
        parentId: data.element.parentId,
        'site._id': req.site._id,
        _w: { $gt: data.element._w }
      }, opts), { $inc: { _w: -1 } }, { multi: true }, function(err) {
        if (err) return next(err);

        // add after to new position
        req.app.models[collectionName].collection.update(buildQuery(req, {
          _id: { $ne: data.element._id },
          parentId: new mongoose.Types.ObjectId(req.body.parentId),
          _w: {$gte: parseInt(req.query.position)}
        }, opts), { $inc: { _w: 1 } }, { multi: true }, next);

      });
    }],
    'setParent': ['changePosition', function(next, data) {
      data.element.parentId = req.body.parentId;
      if (req.query.position) {
        data.element._w = parseInt(req.query.position);
      }

      if (req.app.models[collectionName].schema.paths['site._id']) {
        data.element.site = {
          _id: req.site._id,
          domain: req.site.domain
        };
      }
      data.element.save(next);
    }]
  }, next);

}

module.exports = function (collectionName, opts) {
  var router = express.Router();

  opts = _.extend({}, opts);

  router.get('/tree', _.partial(processGet, collectionName, opts));
  router.get('/:id/tree', _.partial(processGet, collectionName, opts));
  router.post('/:id', _.partial(processPost, collectionName, opts));
  router.put('/:id', _.partial(processPut, collectionName, opts));

  return router;
};
