import models from '../models/models.js';

var appName = 'module.ecommerce.products';

var module = angular.module(appName, [
  'ngTable',
  'ui.utils.masks.global.money',
  'checklist-model',
  models
]);

// controllers
import EcommerceListCtrl from './controllers/EcommerceListCtrl.js';
import EcommerceTreeCtrl from './controllers/EcommerceTreeCtrl.js';
import EcommerceEditProductCtrl from './controllers/EcommerceEditProductCtrl.js';
import EcommerceEditAttributesCtrl from './controllers/EcommerceEditAttributesCtrl.js';
import EcommerceProductReviewsCtrl from './controllers/EcommerceProductReviewsCtrl.js';
import EcommerceRelatedProductsCtrl from './controllers/EcommerceRelatedProductsCtrl.js';
import EcommerceVariationProductCtrl from './controllers/EcommerceVariationProductCtrl.js';
import EcommerceVariationsCtrl from './controllers/EcommerceVariationsCtrl.js';

module.controller('EcommerceListCtrl', EcommerceListCtrl)
  .controller('EcommerceEditProductCtrl', EcommerceEditProductCtrl)
  .controller('EcommerceEditAttributesCtrl', EcommerceEditAttributesCtrl)
  .controller('EcommerceProductReviewsCtrl', EcommerceProductReviewsCtrl)
  .controller('EcommerceRelatedProductsCtrl', EcommerceRelatedProductsCtrl)
  .controller('EcommerceVariationProductCtrl', EcommerceVariationProductCtrl)
  .controller('EcommerceVariationsCtrl', EcommerceVariationsCtrl)
  .controller('EcommerceTreeCtrl', EcommerceTreeCtrl);


import productImagesPreview from './directives/productImagesPreview.js';

module.directive('productImagesPreview', productImagesPreview);

module.config(function ($stateProvider, basePermissionsSetProvider) {
  $stateProvider
    .state('ecommerce', {
      abstract: true,
      parent: 'cabinet',
      template: '<div ui-view></div>',
      resolve: {
        permissions: basePermissionsSetProvider.access(['ecommerce'])
      }
    })
    .state('ecommerce.products', {
      url: "/products",
      controller: 'EcommerceListCtrl',
      templateUrl: "views/modules/ecommerce/page-list.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      }
    })
    .state('ecommerce.create', {
      url: "/products/new?variationId",
      controller: 'EcommerceEditProductCtrl',
      templateUrl: "views/modules/ecommerce/page-edit.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        product: ($stateParams, $q, EcommerceProductModel) => {
          var defer = $q.defer();
          defer.resolve(new EcommerceProductModel({
            price: 1,
            inStockCount: 1
          }));
          return defer.promise;
        },
        variation: ($stateParams, $q, EcommerceProductModel) => {
          var defer = $q.defer();
          if ($stateParams.variationId) {
            EcommerceProductModel.get({_id: $stateParams.variationId }, (product) => {
              defer.resolve(product);
            });
          } else {
            defer.resolve(null);
          }
          return defer.promise;
        }
      }
    })
    .state('ecommerce.edit', {
      url: "/products/:id",
      controller: 'EcommerceEditProductCtrl',
      templateUrl: "views/modules/ecommerce/page-edit.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        product: function($stateParams, EcommerceProductModel) {
          return EcommerceProductModel.get({ _id: $stateParams.id }).$promise;
        },
        variation: () => null
      }
    })
});

export default appName;