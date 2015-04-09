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

function getRoot(req, collectionName, callback) {
  req.app.models[collectionName].findOne({ parentId: null }, function(err, node) {
    if (err) return callback(err);

    if (!node) {
      node = new req.app.models[collectionName]();
      node.title = 'root';
      node.lft = 1;
      node.rgt = 2;
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

function processGet(collectionName, req, res, next) {

  async.auto({
    'root': function(next) {
      if (req.params.id) {
        req.app.models[collectionName].findById(new mongoose.Types.ObjectId(req.params.id), next);
      } else {
        getRoot(req, collectionName, next);
      }
    },
    'tree': ['root', function(next, data) {
      data.root.getArrayTree(function(err, tree) {
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

function processPost(collectionName, req, res, next) {
  async.auto({
    'parent': function(next) {
      req.app.models[collectionName].findById(new mongoose.Types.ObjectId(req.params.id), next);
    },
    'childrens': ['parent', function(next, data) {
      if (!data.parent) {
        return next(req.app.errors.NotFoundError('Node "' + req.params.id + '" not found.'));
      }
      data.parent.getChildren(next);
    }],
    'position': ['parent', 'childrens', function(next, data) {
      if (req.query.insert) {
        req.app.models[collectionName].collection.update({ parentId: data.parent._id }, { $inc: { _w: 1 } }, { multi: true }, function(err, data) {
          if (err) return next(err);

          return next(undefined, 1);
        });
        return;
      }

      next(undefined, data.childrens.length + 1)
    }],
    'insertChildren': ['position', function(next, data) {
      var node = new req.app.models[collectionName]();
      node._w = data.position;
      node.parentId = data.parent._id;
      node.title = 'New node';

      if (req.app.models[collectionName].schema.paths['site._id']) {
        node.site = {
          _id: req.site._id,
          domain: req.site.domain
        };
      }
      node.save(next);
    }]
  }, function(err, data){
    if (err) return next(err);

    res.json(data.insertChildren[0]);
  });

}

function processPut(collectionName, req, res, next) {

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
      req.app.models[collectionName].collection.update({
        _id: { $ne: data.element._id },
        parentId: data.element.parentId,
        _w: { $gt: data.element._w }
      }, { $inc: { _w: -1 } }, { multi: true }, function(err) {
        if (err) return next(err);

        // add after to new position
        req.app.models[collectionName].collection.update({
          _id: { $ne: data.element._id },
          parentId: new mongoose.Types.ObjectId(req.body.parentId),
          _w: {$gte: parseInt(req.query.position)}
        }, { $inc: { _w: 1 } }, { multi: true }, next);

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

module.exports = function (collectionName) {
  var router = express.Router();

  router.get('/tree', _.partial(processGet, collectionName));
  router.get('/:id/tree', _.partial(processGet, collectionName));
  router.post('/:id', _.partial(processPost, collectionName));
  router.put('/:id', _.partial(processPut, collectionName));

  return router;
};
