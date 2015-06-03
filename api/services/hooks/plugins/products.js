'use strict';

var mongoose = require('mongoose'),
  _ = require('lodash'),
  async = require('async'),
  moment = require('moment');

exports['put.products'] = function (req, data, cb) {
  async.auto({
    'product': function(next) {
      req.app.models.products.findById(data._id, next);
    },
    'cleanVariations': ['product', function(next, res) {
      if (!data['variationProduct._id']) {
        return next(null, null);
      }
      req.app.models.products.findOne({ productVariations: { $elemMatch: { _id: data['_id'] } } }, 'productVariations', function(err, item) {
        if (err) { return next(err); }
        if (!item) { return next(); }

        item.productVariations = _.filter(item.productVariations, function(product) {
          return product._id.toString() != res.product._id.toString();
        });
        item.save(next);
      });
    }],
    'variationProduct': ['product', 'cleanVariations', function(next, res) {
      var id = data['variationProduct._id'] || res.product.variationProduct._id;
      if (!id) {
        return next(null, null);
      }
      req.app.models.products.findById(id, next);
    }],
    'updateInfo': ['product', 'variationProduct', function(next, res) {

      if (!res.variationProduct) {
        return next();
      }

      var products = _.filter(res.variationProduct.productVariations, function(product) {
        return product._id.toString() != res.product._id.toString();
      });
      res.product.title = data['title'] || res.product.title;
      res.product.variationTitle = data['variationTitle'] || res.product.variationTitle;
      res.product.price = data['price'] || res.product.price;
      res.product.isInStock = data['isInStock'] || res.product.isInStock;
      res.product.inStockCount = data['inStockCount'] || res.product.inStockCount;
      res.product.code = data['code'] || res.product.code;
      if (typeof data['isPublished'] != 'undefined') {
        res.product.isPublished = data['isPublished'];
      }
      if (data['coverFile._id']) {
        res.product.coverFile = {
          _id: data['coverFile._id']
        };
      }
      products.push(res.product);
      res.variationProduct.withVariations = true;
      res.variationProduct.productVariations = products;
      res.variationProduct.save(next);
    }],
    'saveProduct': ['product', 'variationProduct', function(next, res) {
      res.product.isVariation = res.variationProduct != null;
      res.product.save(next);
    }]
  }, cb);
};