/**
 * Copyright 2014 Cannasos.com
 * GET /api/auth
 */
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
    moment = require('moment'),
    S = require('string'),
    config = require('../../../config.js');

var router = express.Router();

function isHasVote(req, poll) {
  var vote = _.find(poll.votes, {
    ip: req.request.remoteAddress,
    userAgent: req.request.userAgent
  });

  return vote;
}

function getBulletin(req, poll) {
  var key = poll._id + req.request.remoteAddress +
    req.request.userAgent.browser + req.request.userAgent.version +
    req.request.userAgent.os + req.request.userAgent.platform;

  return crypto.createHash('sha1').update(key).digest('hex');
}

router.get('/:_id/vote', function (req, res, next) {
  async.auto({
    'poll': function (next) {
      req.app.models.polls.findById(req.params._id, next);
    },
    'lastVote': ['poll', function(next, data) {
      var vote = isHasVote(req, data.poll);
      next(null, vote);
    }],
    'canVote': ['lastVote', function(next, data) {
      next(null, !data.lastVote);
    }]
  }, function (err, data) {
    if (err) { next(err); }

    if (data.canVote) {
      res.json({ success: true, bulletin: getBulletin(req, data.poll) });
      return;
    }
    var date = moment(data.lastVote.createDate).add(1, 'day');
    res.json({ success: false, nextVoteDate: date.toDate() });
  });
});

router.post('/:_id/vote', function (req, res, next) {
  if (!req.body.choice || !req.body.bulletin || req.body.bulletin != getBulletin(req, { _id: req.params._id })) {
    return res.json({ success: false, message: 'Something wrong' });
  }
  async.auto({
    'poll': function (next) {
      req.app.models.polls.findById(req.params._id, next);
    },
    'choice': ['poll', function(next, res) {
      if (!res.poll) { return next(); }

      next(null, _.find(res.poll.choices, function(item) {
        return item._id.toString() == req.body.choice;
      }));
    }],
    'lastVote': ['poll', 'choice', function(next, data) {
      next(null, isHasVote(req, data.poll));
    }],
    'canVote': ['lastVote', function(next) {
      next(null, true);
    }],
    'vote': ['canVote', 'lastVote', 'poll', 'choice', function(next, res) {
      if (!res.canVote || !res.choice || !res.poll) { return next(); }

      var vote = {
        choise: {
          _id: res.choice._id
        },
        ip: req.request.remoteAddress,
        userAgent: req.request.userAgent,
        bulletin: req.body.bulletin
      };

      res.poll.votes.push(vote);

      res.poll.save(next);
    }]
  }, function (err, data) {
    if (err) { next(err); }

    if (!data.canVote) {
      res.json({ success: false, lastVote: data.lastVote.createDate });
      return;
    }
    res.json({ success: true, choice: data.choice._id });
  });
});


module.exports = router;
