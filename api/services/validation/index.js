'use strict';
var path = require('path'),
  _ = require('lodash'),
  async = require('async');

var validators = {};

exports.registerValidator = function (obj) {
  _.each(_.keys(obj), function (key) {
    if (validators[key]) {
      validators[key].push(obj[key]);
    } else {
      validators[key] = [obj[key]];
    }
  });
};

exports.loadValidators = function (app, cb) {
  var dataDir = path.resolve(__dirname, '..', '..', 'validation', 'validators');
  var count = 0;
  async.auto({
    filesList: function (next) {
      app.services.data.dirWalk(dataDir, next);
    },
    jsonContent: ['filesList', function (next, res) {
      async.each(res.filesList, function (name, nxt) {
        var mod = require(name);
        if (_.isFunction(mod)) {
          mod(app);
        }
        nxt();
        count += 1;
      }, next);
    }]
  }, function (err) {
    if (err) {return cb(err);}
    app.log.info('Validators loaded successfully -', count);
    cb();
  });
};

exports.validate = function (req, action, model, cb) {
  var modelState = require('../../validation/services/modelStateFactory.js')(model, req);
  var validatorFunctions = validators[action];
  if (validatorFunctions) {
    async.each(validatorFunctions, function (val, next) {
      val(modelState, next);
    }, function (err) {
      if (err) {return cb(err);}
      cb(null, modelState.toJSON());
    });
  } else {
    cb(null, modelState.toJSON());
  }
};
