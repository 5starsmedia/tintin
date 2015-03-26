import products from './products/products';

var appName = 'module.ecommerce';

var module = angular.module(appName, [
  products
]);

export default appName;