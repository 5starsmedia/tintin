'use strict';

var async = require('async'),
  _ = require('lodash');

exports['db.products.insert'] = function (app, msg, cb) {
  async.auto({
    'product': function (next) {
      app.models.products.findById(msg.body._id, next);
    },
    'variationProduct': ['product', function (next, data) {
      if (!data.product.variationProduct) {
        return next();
      }
      app.models.products.findById(data.product.variationProduct._id, next);
    }],

    'category': ['product', function (next, data) {
      if (!data.product.category) {
        next();
      }
      app.models.productCategories.findById(data.product.category._id, next);
    }],

    'removeVariation': ['product', 'variationProduct', function (next, data) {
      if (!data.variationProduct) {
        return next();
      }
      data.variationProduct.productVariations.push(data.product);
      data.variationProduct.variationCount = data.variationProduct.productVariations.length;
      data.variationProduct.save(next);
    }],

    'saveProduct': ['product', 'category', function (next, data) {
      if (data.category) {
        data.product.category = data.category;
      }
      data.product.save(next);
    }]
  }, cb);
};

exports['db.products.update'] = function (app, msg, cb) {
  async.auto({
    'product': function (next) {
      app.models.products.findById(msg.body._id, next);
    },
    'variationProduct': ['product', function (next, data) {
      if (!data.product.variationProduct || !data.product.variationProduct._id) {
        return next();
      }
      app.models.products.findById(data.product.variationProduct._id, next);
    }],
    'removeVariation': ['product', 'variationProduct', function (next, data) {
      if (!data.variationProduct) {
        return next();
      }
      data.variationProduct.productVariations = _.reject(data.variationProduct.productVariations, function (item) {
        return item._id.toString() == data.product._id.toString();
      });
      data.variationProduct.productVariations.push(data.product);
      data.variationProduct.variationCount = data.variationProduct.productVariations.length;
      data.variationProduct.save(next);
    }],

    'category': ['product', function (next, data) {
      if (!data.product.category) {
        next();
      }
      app.models.productCategories.findById(data.product.category._id, next);
    }],

    'saveProduct': ['product', 'category', 'variationProduct', function (next, data) {
      if (data.category) {
        data.product.category = data.category;
      }
      data.product.isVariation = !!data.variationProduct;
      data.product.save(next);
    }]
  }, cb);
};

exports['db.products.delete'] = function (app, msg, cb) {
  async.auto({
    'product': function (next) {
      app.models.products.findById(msg.body._id, next);
    },
    'variationProduct': ['product', function (next, data) {
      if (!data.product.variationProduct) {
        return next();
      }
      app.models.products.findById(data.product.variationProduct._id, next);
    }],
    'removeVariation': ['product', 'variationProduct', function (next, data) {
      if (!data.variationProduct) {
        return next();
      }
      data.variationProduct.productVariations = _.filter(data.variationProduct.productVariations, function (product) {
        return product._id.toString() != data.product._id.toString();
      });
      data.variationProduct.variationCount = data.variationProduct.productVariations.length;
      data.variationProduct.save(next);
    }]
  }, cb);
};