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
  visaDate = require('../../models/visaDate.js');

exports.getInfo = function (cb) {
  cb(null, {
    version: '0.0.2',
    requiredVersion: '0.0.1'
  });
};

function createVisa(app, site, cb) {
  async.auto({
    acc: function (next, res) {
      app.log.debug('Creating visa "' + site.title + '"');
      visaDate.create(site, function (err, acc) {
        if (err) {
          return next(err);
        }
        next();
      });
    }
  }, cb);
}

function createVisas(app, cb) {
  fs.readFile(path.join(__dirname, 'json', 'visas.json'), function (err, text) {
    if (err) {
      return cb(err);
    }
    async.each(JSON.parse(text), function (site, next) {
      createVisa(app, site, next);
    }, cb);
  });
}

exports.migrate = function (app, cb) {
  async.auto({
    visas: _.partial(createVisas, app)
  }, function (err) {
    if (err) {
      return cb(err);
    }
    cb();
  });
};
