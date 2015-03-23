/**
 * Copyright 2014 Cannasos.com
 *
 * lib/server/migrations/0.0.1/index.js
 * Migration to version 0.0.1
 */
'use strict';

var async = require('async'),
  fs = require('fs'),
  path = require('path'),
  _ = require('lodash'),
  pwd = require('pwd'),
  moment = require('moment'),
  gender = require('../../models/user/gender.js'),
  sites = require('../../models/core/site.js'),
  posts = require('../../models/post.js'),
  categories = require('../../models/category.js'),
  account = require('../../models/core/account.js');

exports.getInfo = function (cb) {
  cb(null, {
    version: '0.0.1',
    requiredVersion: '0.0.0'
  });
};

function createAccount(app, username, password, title, rolesToAdd, dateOfBirth, gender, cb) {
  async.auto({
    password: function (next) {
      pwd.hash(password, function (err, salt, hash) {
        if (err) {
          return next(err);
        }
        return next(null, {pwd: hash, salt: salt});
      });
    },
    gender: function (next) {
      app.models.genders.findOne({title: new RegExp('^' + gender + '$', 'i')}, next);
    },
    //_.bind(role.find, role, {title: { $in: rolesToAdd}}, '_id title'),
    acc: ['password', 'gender', function (next, res) {
      var acc = {
        username: username,
        pwd: res.password.pwd,
        salt: res.password.salt,
        title: title,
        roles: rolesToAdd,
        profile: {
          dateOfBirth: moment.utc(dateOfBirth, 'DD.MM.YYYY'),
          gender: res.gender.toObject()
        }
      };
      if (process.env.NODE_ENV === 'test') {
        acc.tokens = [
          {value: 'testToken-' + username, persist: true, expireAt: Date.now() + 10 * 60000}
        ];
      }
      app.log.debug('Creating account for "' + username + '"');
      account.create(acc, function (err, acc) {
        if (err) {
          return next(err);
        }
        next();
        //app.services.mq.push(app, 'events', {name: 'db.accounts.insert', _id: acc._id}, next);
      });
    }]
  }, cb);
}

function createPost(app, post, cb) {
  async.auto({
    category: function (next) {
      app.models.categories.findOne({title: 'Test'}, next);
    },
    post: ['category', function (next, res) {
      app.log.debug('Creating post "' + post.title + '"');
      post.category = res.category;
      posts.create(post, function (err, acc) {
        if (err) {
          return next(err);
        }
        next();
      });
    }]
  }, cb);
}

function createSite(app, site, cb) {
  async.auto({
    acc: function (next, res) {
      app.log.debug('Creating site "' + site.domain + '"');
      sites.create(site, function (err, acc) {
        if (err) {
          return next(err);
        }
        next();
      });
    }
  }, cb);
}

function createAccounts(app, cb) {
  fs.readFile(path.join(__dirname, 'json', 'accounts.json'), function (err, text) {
    if (err) {
      return cb(err);
    }
    async.each(JSON.parse(text), function (account, next) {
      createAccount(app, account.username, account.password, account.title, account.roles, account.dateOfBirth, account.gender, next);
    }, cb);
  });
}

function createGenders(cb) {
  async.parallel([
    _.bind(gender.create, gender, {title: 'Male', cssClass: 'gender-male'}),
    _.bind(gender.create, gender, {title: 'Female', cssClass: 'gender-female'})
  ], cb);
}

function createPosts(app, cb) {
  fs.readFile(path.join(__dirname, 'json', 'posts.json'), function (err, text) {
    if (err) {
      return cb(err);
    }
    async.each(JSON.parse(text), function (post, next) {
      createPost(app, post, next);
    }, cb);
  });
}

function createSites(app, cb) {
  fs.readFile(path.join(__dirname, 'json', 'sites.json'), function (err, text) {
    if (err) {
      return cb(err);
    }
    async.each(JSON.parse(text), function (site, next) {
      createSite(app, site, next);
    }, cb);
  });
}

function createCategories(app, cb) {
  fs.readFile(path.join(__dirname, 'json', 'categories.json'), function (err, text) {
    if (err) {
      return cb(err);
    }
    async.each(JSON.parse(text), function (category, next) {
      categories.create(category, function (err) {
        if (err) {
          return next(err);
        }
        next();
      });
    }, cb);
  });
}

exports.migrate = function (app, cb) {
  async.auto({
    genders: createGenders,
    categories: _.partial(createCategories, app),
    posts: ['categories', _.partial(createPosts, app)],
    sites: _.partial(createSites, app),
    accounts: ['genders', _.partial(createAccounts, app)]
  }, function (err) {
    if (err) {
      return cb(err);
    }
    cb();
  });
};
