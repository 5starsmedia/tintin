var appName = 'module.ecommerce.models';

var module = angular.module(appName, [
  'ngResource'
]);

// models
import EcommerceProductModel from './EcommerceProductModel.js';
import EcommerceCategoryModel from './EcommerceCategoryModel.js';
import EcommerceBrandModel from './EcommerceBrandModel.js';
import EcommerceTypeModel from './EcommerceTypeModel.js';
import EcommerceTypeFieldModel from './EcommerceTypeFieldModel.js';
import EcommerceReviewModel from './EcommerceReviewModel.js';
import EcommerceProductFieldModel from './EcommerceProductFieldModel.js';

module.factory('EcommerceProductModel', EcommerceProductModel)
  .factory('EcommerceBrandModel', EcommerceBrandModel)
  .factory('EcommerceTypeModel', EcommerceTypeModel)
  .factory('EcommerceTypeFieldModel', EcommerceTypeFieldModel)
  .factory('EcommerceReviewModel', EcommerceReviewModel)
  .factory('EcommerceProductFieldModel', EcommerceProductFieldModel)
  .factory('EcommerceCategoryModel', EcommerceCategoryModel);

export default appName;