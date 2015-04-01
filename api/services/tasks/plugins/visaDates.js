'use strict';

var async = require('async'),
  mongoose = require('mongoose'),
  _ = require('lodash');

exports['visaDates.check'] = function (app, msg, cb) {
  console.info('visaDates.check');

  app.models.visaDates.find({ isEnabled: true }, function(err, visas) {
    if (err) { return cb(err); }
    console.info(visas);

    cb();
  });
};