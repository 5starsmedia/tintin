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
  sites = require('../../models/core/site.js'),
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
    //_.bind(role.find, role, {title: { $in: rolesToAdd}}, '_id title'),
    acc: ['password', function (next, res) {
      var acc = {
        username: username,
        pwd: res.password.pwd,
        salt: res.password.salt,
        title: title,
        roles: rolesToAdd,
        activated: true,
        profile: {
          dateOfBirth: moment.utc(dateOfBirth, 'DD.MM.YYYY'),
          gender: gender
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

function createSite(app, site, cb) {
  async.auto({
    site: function (next) {
      app.log.debug('Creating site "' + site.domain + '"');
      sites.create(site, next);
    }
  }, cb);
}

function createAccounts(app, cb) {
  fs.readFile(path.join(__dirname, 'json', 'accounts.json'), function (err, text) {
    if (err) {
      return cb(err);
    }
    async.each(JSON.parse(text), function (account, next) {
      app.log.debug('Creating account "' + account.username + '"');

      createAccount(app, account.username, account.password, account.title, account.roles, account.dateOfBirth, account.gender, next);
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

exports.migrate = function (app, cb) {
  async.auto({
    sites: _.partial(createSites, app),
    accounts: _.partial(createAccounts, app)
  }, function (err) {
    if (err) {
      return cb(err);
    }
    cb();
  });
};
