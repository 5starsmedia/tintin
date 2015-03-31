'use strict';

var request = require('request'),
  async = require('async');

function accountByFbId(app, id, cb) {
  app.models.accounts.findOne({login: id}, function (err, acc) {
    if (err) { return cb(err); }
    if (!acc) {
      request('http://graph.facebook.com/' + id, function (err, resp, body) {
        if (err) { return cb(err); }
        body = JSON.parse(body);
        acc = new app.models.accounts();
        acc.accountType = 'facebook';
        acc.login = id;
        acc.title = body.name;
        acc.profile.facebookUrl = body.link;
        acc.profile.firstName = body.first_name;
        acc.profile.lastName = body.last_name;
        app.log.debug('Creating account for facebook user "' + body.name + '"...');
        app.models.genders.findOne({title: new RegExp('^' + body.gender + '$', 'i')}, function (err, gender) {
          if (err) { return cb(err); }
          if (gender) {
            acc.profile.gender = gender.toObject();
          }
          acc.save(cb);
        });
      });
    } else {
      cb(null, acc.toObject());
    }
  });
}

function padNumberString(number, padStr) {
  var len = padStr.length;
  number = number.toString();
  return number.length >= len ? number : (padStr + number).slice(-len);
}

function createComment(app, blog, d, cb) {
  app.models.comments.findOne({socialName: 'facebook', socialId: d.id}, function (err, comm) {
    if (err) { return cb(err); }
    if (!comm) {
      app.services.sequence.getNext('comments', function (err, value) {
        if (err) { return cb(err); }
        var cid = padNumberString(value.toString(16).toLowerCase(), '0000000000');
        accountByFbId(app, d.from.id, function (err, acc) {
          if (err) { return cb(err); }
          var comment = new app.models.comments();
          comment.createDate = d.created_time;
          comment.text = d.message;
          comment.cid = cid;
          comment.indent = 0;
          comment.account = acc;
          comment.collectionName = 'blogs';
          comment.resourceId = blog._id;
          comment.socialName = 'facebook';
          comment.socialId = d.id;
          comment.save(function (err) {
            if (err) { return cb(err); }
            app.log.debug('Comment from facebook user "' + acc.title + '" created successfully');
          });
        });
      });
    } else {
      cb();
    }
  });
}

function createReq(app, url, blog, cb) {
  request(url, function (err, response, body) {
    if (err) { return cb(err); }
    var bodyObj = JSON.parse(body);
    var data = bodyObj.data;
    if (!data) { return cb(); }
    async.eachSeries(data, function (d, next) {
      createComment(app, blog, d, next);
    }, function (err) {
      if (err) { return cb(err); }
      if (bodyObj.paging && bodyObj.paging.next) {
        createReq(app, bodyObj.paging.next, blog, cb);
      } else {
        cb();
      }
    });
  });
}
// http://graph.facebook.com/{user_id or page_id}?fields=cover
exports['social.importFbComments'] = function (app, msg, cb) {
  app.models.blogs.find({'socialLinks.facebook': {$exists: true}}, function (err, blogs) {
    if (err) { return cb(err); }
    async.eachSeries(blogs, function (blog, next) {
      if (!blog.socialLinks.facebook || blog.socialLinks.facebook.length === 0) { return next(); }
      createReq(app, 'http://graph.facebook.com/comments?id=' + blog.socialLinks.facebook + '&summary=true', blog,
        next);
    }, cb);
  });
};
