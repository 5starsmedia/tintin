'use strict';

var mongoose = require('mongoose'),
  _ = require('lodash'),
  async = require('async'),
  moment = require('moment');

exports['post.products'] = function (req, data, cb) {
  async.auto({
    'variationProduct': function(next, res) {
      var id = data['variationProduct._id'];
      if (!id) { return next(); }
      req.app.models.products.findById(id, next);
    },
    'saveProduct': ['variationProduct', function(next, res) {
      data.isVariation = res.variationProduct != null;
      next();
    }]
  }, cb);
};