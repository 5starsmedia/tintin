'use strict';

var async = require('async'),
  moment = require('moment'),
  natural = require('natural'),
  TfIdf = natural.TfIdf,
  _ = require('lodash');

function stripTags(str){
  return str.replace(/<[^>]+>/gi, ' ');
};

exports['posts.keywords'] = function (app, msg, cb) {
  async.auto({
    'posts': function(next) {
      app.models.posts.find({}, next);
    },
    'generateKeywords': ['posts', function(next, res) {
      _.forEach(res.posts, function(item) {
        app.services.mq.push(app, 'events', {name: 'db.posts.update', _id: item._id});
      });
      next();
    }]
  }, cb);
};

exports['db.posts.insert'] = exports['db.posts.update'] = function (app, msg, cb) {
  async.auto({
    'post': function(next) {
      app.models.posts.findById(msg.body._id, next);
    },
    'generateKeywords': ['post', function(next, res) {
      var tfidf = new TfIdf();
      tfidf.addDocument(res.post.title + ' ' + stripTags(res.post.body));

      app.log.info('Generate keywords for ' + res.post._id)
      res.post.keywords = [];
      tfidf.listTerms(0).forEach(function(item) {
        if (res.post.keywords.length >= 10) {
          return;
        }
        app.log.info(item.term)
        res.post.keywords.push({
          word: item.term,
          importance: item.tfidf
        });
      });
    }]
  }, function (err, res) {
    if (err) { return cb(err); }
    res.post.save(cb);
  });
};