'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  mongoose = require('mongoose'),
  router = express.Router();

router.get('/', function (req, res, next) {
  if (!req.query.eventType) {
    return next();
  }
  async.auto({
    'items': function(next) {
      return req.app.models.states.find({ eventType: req.query.eventType, 'site._id': req.site._id }, next);
    },
    'create': ['items', function(next, data) {
      if (data.items.length > 0) {
        return next();
      }
      req.app.services.data.getResource('states', function(err, data) {
        if (err) { return next(err); }

        var eventType = _.find(data, { eventType: req.query.eventType });
        if (!eventType) {
          return next();
        }
        var state = new req.app.models.states(eventType);
        state.stateType = 'start';
        state.site = req.site;
        state.save(function(err, start) {
          if (err) { return next(err); }

          var state = new req.app.models.states(eventType);
          state.stateType = 'end';
          state.title = 'End of the processing';
          state.parentId = start._id;
          state.site = req.site;
          state.save(next);
        });
      });
    }]
  }, next);
});

router.delete('/:_id', function (req, res, next) {
  async.auto({
    'state': function(next) {
      return req.app.models.states.findOne({ _id: req.params._id, 'site._id': req.site._id }, next);
    },
    'removeIf': ['state', function (next, res) {
      if (res.state.stateType.substring(0, 3) == 'if.') {
        req.app.models.states.findOne({ parentId: new mongoose.Types.ObjectId(res.state._id), _w: { $gt: 1 } }, function(err, data) {
          if (err) { return next(err); }
          if (!data) { return next(); }
          data.remove(next);
        });
      } else {
        next();
      }
    }],
    'childs': ['state', 'removeIf', function (next, res) {
      req.app.models.states.find({ path: { $regex: ',' + res.state._id.toString() } }, next);
    }],
    'updateParent': ['state', 'childs', function (next, res) {
      async.mapLimit(res.childs, 1, function(doc, cbNext){
        if (doc.parentId.toString() == res.state._id.toString()) {
          doc.parentId = res.state.parentId;
        }
        doc.path = doc.path.replace(','+ res.state._id.toString(), '');
        doc.save(cbNext);
      }, next);
    }]
  }, function(err, data) {
    if (err) { return next(err); }

    data.state.remove(function() {
      res.status(204).end();
    });
  });
});

module.exports = router;