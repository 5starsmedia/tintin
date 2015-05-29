'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  request = require('request'),
  cheerio = require('cheerio'),
  akismet = require('akismet'),
  router = express.Router();

router.put('/:id/spam', function (req, res, next) {
  var akismetApi = akismet.client({ blog: 'http://v-androide.com', apiKey: '661ba60b0e5f' });

  async.auto({
    'comment': function (next) {
      return req.app.models.comments.findById(req.params.id, next);
    },
    'isSpam': ['comment', function(next, data) {
      akismetApi.submitSpam({
        //user_ip: '1.1.1.1',
        //permalink: 'http://www.my.blog.com/my-post',
        comment_author: data.comment.account.title,
        comment_content: data.comment.text
      }, next);
    }]
  }, function(err, data) {
    if (err) { return next(err); }

    data.comment.isSpam = true;
    if (data.comment.isSpam) {
      data.comment.isPublished = false;
    }
    data.comment.save(function(err) {
      if (err) { return next(err); }

      res.json(data.comment);
    });
  });
});

module.exports = router;