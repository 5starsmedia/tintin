'use strict';

var akismet = require('akismet'),
  _ = require('lodash'),
  async = require('async');

exports['db.comments.insert'] = exports['db.comments.delete'] = function (app, msg, cb) {
  app.models.comments.findById(msg.body._id, function (err, comment) {
    if (err) { return cb(err); }
    app.models.comments.count({
      collectionName: comment.collectionName,
      resourceId: comment.resourceId,
      removed: {$exists: false}
    }, function (err, commentsCount) {
      if (err) { return cb(err); }
      app.models[comment.collectionName].findById(comment.resourceId, 'commentsCount lastComment', function (err, obj) {
        if (err) { return cb(err); }
        obj.commentsCount = commentsCount;
        obj.lastComment = comment.toObject();
        obj.save(cb);
      });
    });
  });


  app.services.mq.push(app, 'events', {name: 'comments.checkSpam', _id: msg.body._id});
};

exports['db.accounts.update'] = function (app, msg, cb) {
  app.models.accounts.findById(msg.body._id, function (err, account) {
    if (err) { return cb(err); }
    if (account.coverFile) {
      app.models.comments.update({'account._id': account._id}, {account: account.toObject()}, {multi: true}, cb);
    } else {
      cb();
    }
  });
};


exports['comments.checkSpamAll'] = function (app, msg, cb) {
  app.models.comments.find({}, '_id', function(err, comments) {
    if (err) { return cb(err); }

    _.forEach(comments, function (comment) {
      app.services.mq.push(app, 'events', {name: 'comments.checkSpam', _id: comment._id});
    });
    cb();
  });
};

exports['comments.checkSpam'] = function (app, msg, cb) {
  var akismetApi = akismet.client({ blog: 'http://v-androide.com', apiKey: '661ba60b0e5f' });

  async.auto({
    'comment': function(next) {
      app.models.comments.findById(msg.body._id, next);
    },
    'post': ['comment', function(next, data) {
      app.models.posts.findById(data.comment.resourceId, next);
    }],
    'isSpam': ['comment', function(next, data) {
      akismetApi.checkSpam({
        //user_ip: '1.1.1.1',
        //permalink: 'http://www.my.blog.com/my-post',
        comment_author: data.comment.account.title,
        comment_content: data.comment.text
      }, next);
    }],
    'updateSite': ['post', function(next, data) {
      data.comment.site = {
        '_id': data.post.site._id,
        'domain': data.post.site.domain
      };
      data.comment.save(next);
    }]
  }, function (err, data) {
    if (err) { return cb(err); }

    data.comment.isSpam = data.isSpam;
    if (data.comment.isSpam) {
      data.comment.isPublished = false;
    }
    data.comment.save(cb);
  });
};