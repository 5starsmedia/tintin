'use strict';

var async = require('async'),
  fs = require('fs'),
  path = require('path'),
  _ = require('lodash'),
  pwd = require('pwd'),
  moment = require('moment'),
  account = require('../../models/core/account.js'),
  role = require('../../modules/users/models/role.js');

exports.getInfo = function (cb) {
  cb(null, {
    version: '0.0.4',
    requiredVersion: '0.0.3'
  });
};

function createRole(app, roleItem, cb) {
  async.auto({
    acc: function (next, res) {
      app.log.debug('Creating role "' + roleItem.title + '"');
      role.create(roleItem, function (err, acc) {
        if (err) {
          return next(err);
        }
        next();
      });
    }
  }, cb);
}

function createRoles(app, cb) {
  fs.readFile(path.join(__dirname, 'json', 'roles.json'), function (err, text) {
    if (err) { return cb(err); }
    async.each(JSON.parse(text), function (site, next) {
      createRole(app, site, next);
    }, cb);
  });
}

exports.migrate = function (app, cb) {
  async.auto({
    roles: _.partial(createRoles, app)
  }, function (err) {
    if (err) {
      return cb(err);
    }
    account.findOne({}, function(err, account) {
      if (err) { return next(err); }

      role.findOne({}, function(err, role) {
        if (err) { return next(err); }

        account.roles = [];
        account.roles.push(role);
        account.save(cb);
      });
    });
  });
};
