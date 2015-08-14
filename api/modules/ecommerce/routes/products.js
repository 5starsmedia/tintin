'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  request = require('request'),
  cheerio = require('cheerio'),
  router = express.Router();

router.delete('/:id/variation', function (req, res, next) {

  async.auto({
    'product': function(next) {
      req.app.models.products.findById(req.params.id, next);
    },
    'variationProduct': ['product', function(next, data) {
      if (!data.product) {
        return next();
      }
      req.app.models.products.findById(data.product.variationProduct._id, next);
    }],
    'saveVariationProduct': ['product', 'variationProduct', function(next, data) {
      if (!data.variationProduct || !data.product) {
        return next();
      }
      data.variationProduct.productVariations = _.filter(data.variationProduct.productVariations, function(product) {
        return product._id.toString() != data.product._id.toString();
      });
      data.variationProduct.withVariations = data.variationProduct.productVariations.length > 0;
      data.variationProduct.variationCount -= 1;
      data.variationProduct.save(next);
    }],
    'saveProduct': ['product', 'saveVariationProduct', function(next, data) {
      if (!data.product) {
        return next();
      }
      data.product.isVariation = false;
      data.product.variationProduct = undefined;
      data.product.markModified('variationProduct');
      data.product.save(next);
    }]
  }, function (err, data) {
    if (err) { return next(err); }

    return res.status(204).end();
  });

});


module.exports = router;