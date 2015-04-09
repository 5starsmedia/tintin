var appName = 'module.ecommerce.models';

var module = angular.module(appName, [
  'ngResource',
  'ngEditableTree'
]);

// models
import EcommerceProductModel from './EcommerceProductModel.js';
import EcommerceCategoryModel from './EcommerceCategoryModel.js';
import EcommerceBrandModel from './EcommerceBrandModel.js';
import EcommerceTypeModel from './EcommerceTypeModel.js';
import EcommerceFieldModel from './EcommerceFieldModel.js';
import EcommerceReviewModel from './EcommerceReviewModel.js';

module.factory('EcommerceProductModel', EcommerceProductModel)
  .factory('EcommerceBrandModel', EcommerceBrandModel)
  .factory('EcommerceTypeModel', EcommerceTypeModel)
  .factory('EcommerceFieldModel', EcommerceFieldModel)
  .factory('EcommerceReviewModel', EcommerceReviewModel)
  .factory('EcommerceCategoryModel', EcommerceCategoryModel);

export default appName;