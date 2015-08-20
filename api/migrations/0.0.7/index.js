'use strict';

var async = require('async'),
  fs = require('fs'),
  path = require('path'),
  _ = require('lodash'),
  pwd = require('pwd'),
  moment = require('moment'),
  issueType = require('../../modules/issues/models/issueType.js');

exports.getInfo = function (cb) {
  cb(null, {
    version: '0.0.7',
    requiredVersion: '0.0.6'
  });
};

function createIssueTypes(app, cb) {
  fs.readFile(path.join(__dirname, 'json', 'issueTypes.json'), function (err, text) {
    if (err) {
      return cb(err);
    }
    async.each(JSON.parse(text), function (category, next) {
      issueType.create(category, function (err) {
        if (err) { return next(err); }
        next();
      });
    }, cb);
  });
}

exports.migrate = function (app, cb) {
  async.auto({
    issueTypes: _.partial(createIssueTypes, app)
  }, function (err) {
    if (err) {
      return cb(err);
    }
    cb();
  });
};
