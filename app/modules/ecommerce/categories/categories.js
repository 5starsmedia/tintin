var appName = 'module.ecommerce.categories';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'ngTable',
  'ui.select',
  'ngSanitize',
  'sticky',
  'ng-sortable',
  models
]);

// controllers
import EcommerceEditCategoryCtrl from './controllers/EcommerceEditCategoryCtrl.js';
import EcommerceCategoriesCtrl from './controllers/EcommerceCategoriesCtrl.js';

module.controller('EcommerceEditCategoryCtrl', EcommerceEditCategoryCtrl)
  .controller('EcommerceCategoriesCtrl', EcommerceCategoriesCtrl);


module.config(function ($stateProvider) {
  $stateProvider
    .state('ecommerce.categories', {
      url: "/product-categories",
      controller: 'EcommerceCategoriesCtrl',
      templateUrl: "views/modules/ecommerce/categories/page-list.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      }
    })
    .state('ecommerce.categories.edit', {
      url: "/:id",
      controller: 'EcommerceEditCategoryCtrl',
      templateUrl: "views/modules/ecommerce/categories/page-edit.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        item: function($stateParams, EcommerceCategoryModel) {
          return EcommerceCategoryModel.get({ _id: $stateParams.id }).$promise;
        }
      }
    })
});

export default appName;