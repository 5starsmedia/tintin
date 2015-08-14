'use strict';

var async = require('async'),
  fs = require('fs'),
  path = require('path'),
  _ = require('lodash'),
  pwd = require('pwd'),
  moment = require('moment'),
  products = require('../../modules/ecommerce/models/product.js');

exports.getInfo = function (cb) {
  cb(null, {
    version: '0.0.3',
    requiredVersion: '0.0.2'
  });
};

exports.migrate = function (app, cb) {
  products.find({}, function(err, data) {
    if (err) { return cb(err); }

    async.eachLimit(data, 1, function(item, next) {
      item.isVariation = !!(item.variationProduct && item.variationProduct._id);
      item.withVariations = item.productVariations.length > 0;
      item.save(next);
    }, cb)
  });
};
