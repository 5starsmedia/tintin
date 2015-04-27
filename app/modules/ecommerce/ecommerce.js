import products from './products/products';
import types from './types/types';
import brands from './brands/brands';
import currencies from './currencies/currencies';
import categories from './categories/categories';

var appName = 'module.ecommerce';

var module = angular.module(appName, [
  products,
  types,
  categories,
  brands,
  currencies
]);

export default appName;