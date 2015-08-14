import models from '../models/models.js';

var appName = 'module.ecommerce.brands';

var module = angular.module(appName, [
  'ngTable',
  'ui.utils.masks.global.money',
  'checklist-model',
  models
]);

// controllers
import EcommerceBrandsCtrl from './controllers/EcommerceBrandsCtrl.js';
import EcommerceBrandsEditCtrl from './controllers/EcommerceBrandsEditCtrl.js';

module.controller('EcommerceBrandsCtrl', EcommerceBrandsCtrl)
  .controller('EcommerceBrandsEditCtrl', EcommerceBrandsEditCtrl);

module.config(function ($stateProvider) {
  $stateProvider
    .state('ecommerce.brands', {
      url: "/product-brands",
      controller: 'EcommerceBrandsCtrl',
      templateUrl: "views/modules/ecommerce/brands/page-list.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      }
    })
    .state('ecommerce.brandCreate', {
      url: "/product-brands/new",
      controller: 'EcommerceBrandsEditCtrl',
      templateUrl: "views/modules/ecommerce/brands/page-edit.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        brand: ($stateParams, $q, EcommerceBrandModel) => {
          var defer = $q.defer();
          defer.resolve(new EcommerceBrandModel({}));
          return defer.promise;
        }
      }
    })
    .state('ecommerce.brandEdit', {
      url: "/product-brands/:_id",
      controller: 'EcommerceBrandsEditCtrl',
      templateUrl: "views/modules/ecommerce/brands/page-edit.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        brand: function($stateParams, EcommerceBrandModel) {
          return EcommerceBrandModel.get({ _id: $stateParams._id }).$promise;
        }
      }
    })
});

export default appName;