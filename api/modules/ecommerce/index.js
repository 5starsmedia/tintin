'use strict';

var nestedSet = require('../../middleware/nestedSet.js');

function EcommerceModule(app) {
  this.app = app;
}


EcommerceModule.prototype.initModels = function () {
  this.app.models.products = require('./models/product.js');
  this.app.models.productTypes = require('./models/productType.js');
  this.app.models.productFields = require('./models/productField.js');
  this.app.models.productBrands = require('./models/productBrand.js');
  this.app.models.productCategories = require('./models/productCategory.js');
  this.app.models.productCurrencies = require('./models/productCurrency.js');
  this.app.models.carts = require('./models/cart.js');
  this.app.models.wishlists = require('./models/wishlist.js');
};

EcommerceModule.prototype.initRoutes = function () {
  this.app.server.use('/api/products', require('./routes/products.js'));
  this.app.server.use('/api/productTypes', nestedSet('productTypes'));
  this.app.server.use('/api/productCategories', nestedSet('productCategories'));
};

module.exports = EcommerceModule;