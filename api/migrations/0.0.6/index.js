'use strict';

var async = require('async'),
  fs = require('fs'),
  path = require('path'),
  _ = require('lodash'),
  pwd = require('pwd'),
  moment = require('moment'),
  category = require('../../modules/posts/models/category.js');

exports.getInfo = function (cb) {
  cb(null, {
    version: '0.0.6',
    requiredVersion: '0.0.5'
  });
};


exports.migrate = function (app, cb) {
  category.update({}, { $set: { postType: 'post' } }, { multi: true }, cb);
};
