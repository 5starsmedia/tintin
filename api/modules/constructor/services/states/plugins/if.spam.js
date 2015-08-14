'use strict';

var async = require('async'),
  moment = require('moment'),
  akismet = require('akismet'),
  _ = require('lodash');

exports['if.spam'] = function (app, state, args, next) {
  async.auto({
    'comment': function(next) {
      app.models.comments.findById(args._id, next);
    },
    'site': ['comment', function(next, data) {
      app.models.sites.findById(data.comment.site._id, next);
    }],
    'api': ['site', function(next, data) {
      next(null, akismet.client({ blog: 'http://' + data.site.domain, apiKey: '661ba60b0e5f' }));
    }],
    'post': ['comment', function(next, data) {
      app.models.posts.findById(data.comment.resourceId, next);
    }],
    'isSpam': ['comment', 'api', function(next, data) {
      data.api.checkSpam({
        //user_ip: '1.1.1.1',
        //permalink: 'http://www.my.blog.com/my-post',
        comment_author: data.comment.account.title,
        comment_content: data.comment.text
      }, next);
    }],
    'updateSite': ['post', function(next, data) {
      if (data.post) {
        data.comment.site = {
          '_id': data.post.site._id,
          'domain': data.post.site.domain
        };
      } else {
        data.comment.isPublished = false;
      }
      data.comment.save(next);
    }]
  }, function (err, data) {
    if (err) { return cb(err); }

    data.comment.isSpam = data.isSpam;
    if (data.comment.isSpam) {
      data.comment.isPublished = false;
    }
    data.comment.save(function(err) {
      if (err) { return next(err); }
      if (data.comment.isSpam || !state.children || !state.children[1]) { return next(); }

      state.children[0] = null;
      app.services.states.executeState(state.children[1], args, next);
    });
  });
};