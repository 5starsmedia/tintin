import models from '../models/models.js';

var appName = 'module.ecommerce.currencies';

var module = angular.module(appName, [
  'ngTable',
  'ui.utils.masks.global.money',
  'checklist-model',
  models
]);

// controllers
import EcommerceCurrenciesCtrl from './controllers/EcommerceCurrenciesCtrl.js';
import EcommerceCurrencyEditCtrl from './controllers/EcommerceCurrencyEditCtrl.js';

module.controller('EcommerceCurrenciesCtrl', EcommerceCurrenciesCtrl)
  .controller('EcommerceCurrencyEditCtrl', EcommerceCurrencyEditCtrl);

module.config(function ($stateProvider) {
  $stateProvider
    .state('ecommerce.currencies', {
      url: "/product-currencies",
      controller: 'EcommerceCurrenciesCtrl',
      templateUrl: "views/modules/ecommerce/currencies/page-list.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      }
    })
    .state('ecommerce.currencyCreate', {
      url: "/product-currencies/new",
      controller: 'EcommerceCurrencyEditCtrl',
      templateUrl: "views/modules/ecommerce/currencies/page-edit.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        currency: ($stateParams, $q, EcommerceCurrencyModel) => {
          var defer = $q.defer();
          defer.resolve(new EcommerceCurrencyModel({
            alias: 'USD',
            symbol: '$',
            factor: 1
          }));
          return defer.promise;
        }
      }
    })
    .state('ecommerce.currencyEdit', {
      url: "/product-currencies/:_id",
      controller: 'EcommerceCurrencyEditCtrl',
      templateUrl: "views/modules/ecommerce/currencies/page-edit.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        currency: function($stateParams, EcommerceCurrencyModel) {
          return EcommerceCurrencyModel.get({ _id: $stateParams._id }).$promise;
        }
      }
    })
});

export default appName;