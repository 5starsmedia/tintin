'use strict';

var async = require('async'),
  mongoose = require('mongoose'),
  _ = require('lodash');

exports['visaDates.check'] = function (app, msg, cb) {
  console.info('visaDates.check');

  req.app.models.visaDates.find({ isEnabled: true }, function(visas) {
    console.info(visas);

    cb();
  });
};