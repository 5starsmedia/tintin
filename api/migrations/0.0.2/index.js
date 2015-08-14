'use strict';

var async = require('async'),
  fs = require('fs'),
  path = require('path'),
  _ = require('lodash'),
  pwd = require('pwd'),
  moment = require('moment');

exports.getInfo = function (cb) {
  cb(null, {
    version: '0.0.2',
    requiredVersion: '0.0.1'
  });
};


exports.migrate = function (app, cb) {
  cb();
};
