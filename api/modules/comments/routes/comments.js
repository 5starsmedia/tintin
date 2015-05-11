'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  router = express.Router();

router.get('/moderate', function (req, res, next) {
  if (req.auth.isGuest) {
    res.status(401).end();
  } else {
    req.app.models.comments.find({ 'removed': {$exists: false} }, function (err, comments) {
      if (err) { return next(err); }

      _.forEach(comments, function(comment) {
        var acc = comment.toObject();
        if ((!acc.account || !acc.account.title) && acc.realAccount.title) {
          comment.account = {
            title: acc.realAccount.title,
            email: acc.realAccount.email
          };
          comment.save();
        }
      });

      res.json(comments);
    });
  }
});

module.exports = router;