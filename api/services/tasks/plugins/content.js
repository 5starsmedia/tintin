'use strict';

var async = require('async');

exports['content.unfresh'] = function (c, app, msg, next) {
  var today = new Date();
  var freshDate = new Date(today);
  freshDate = new Date(freshDate.setDate(today.getDate() - 7));
  async.parallel([
    function (next) {
      var query = {isFresh: true, publishDate: {$lt: freshDate}, removed: {$exists: false}};
      app.models.blogs.update(query, {$set: {isFresh: false}}, {multi: true}, function (err, count) {
        if (err) { return next(err); }
        c.log.debug('Blog posts processed - %s', count);
        next();
      });
    }, function (next) {
      var query = {isFresh: true, createDate: {$lt: freshDate}, removed: {$exists: false}};
      app.models.advices.update(query, {$set: {isFresh: false}}, {multi: true}, function (err, count) {
        if (err) { return next(err); }
        c.log.debug('Advices processed - %s', count);
        next();
      });
    }
  ], next);
};

