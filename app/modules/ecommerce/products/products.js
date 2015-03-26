import models from '../models/models.js';

var appName = 'module.ecommerce.products';

var module = angular.module(appName, [
  'ngTable',
  models
]);

// controllers
import EcommerceListCtrl from './controllers/EcommerceListCtrl.js';
import EcommerceTreeCtrl from './controllers/EcommerceTreeCtrl.js';
import EcommerceEditProductCtrl from './controllers/EcommerceEditProductCtrl.js';
import EcommerceEditAttributesCtrl from './controllers/EcommerceEditAttributesCtrl.js';
import EcommerceProductReviewsCtrl from './controllers/EcommerceProductReviewsCtrl.js';
import EcommerceRelatedProductsCtrl from './controllers/EcommerceRelatedProductsCtrl.js';

module.controller('EcommerceListCtrl', EcommerceListCtrl)
  .controller('EcommerceEditProductCtrl', EcommerceEditProductCtrl)
  .controller('EcommerceEditAttributesCtrl', EcommerceEditAttributesCtrl)
  .controller('EcommerceProductReviewsCtrl', EcommerceProductReviewsCtrl)
  .controller('EcommerceRelatedProductsCtrl', EcommerceRelatedProductsCtrl)
  .controller('EcommerceTreeCtrl', EcommerceTreeCtrl);

module.config(function ($stateProvider) {
  $stateProvider
    .state('ecommerce', {
      abstract: true,
      templateUrl: "views/common/content_small.html"
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
      url: "/products/new",
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

          }));
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
        post: function($stateParams, EcommerceProductModel) {
          return EcommerceProductModel.get({ _id: $stateParams.id }).$promise;
        }
      }
    })
});

export default appName;