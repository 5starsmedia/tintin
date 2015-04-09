import products from './products/products';
import types from './types/types';
import categories from './categories/categories';

var appName = 'module.ecommerce';

var module = angular.module(appName, [
  products,
  types,
  categories
]);

export default appName;