var appName = 'module.ecommerce.types';

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
import EcommerceEditFieldCtrl from './controllers/EcommerceEditFieldCtrl.js';
import EcommerceEditTypeCtrl from './controllers/EcommerceEditTypeCtrl.js';
import EcommerceTypesCtrl from './controllers/EcommerceTypesCtrl.js';

module.controller('EcommerceEditFieldCtrl', EcommerceEditFieldCtrl)
  .controller('EcommerceEditTypeCtrl', EcommerceEditTypeCtrl)
  .controller('EcommerceTypesCtrl', EcommerceTypesCtrl);


module.config(function ($stateProvider) {
  $stateProvider
    .state('ecommerce.types', {
      url: "/product-types",
      controller: 'EcommerceTypesCtrl',
      templateUrl: "views/modules/ecommerce/types/page-list.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      }
    })
    .state('ecommerce.types.edit', {
      url: "/:id",
      controller: 'EcommerceEditTypeCtrl',
      templateUrl: "views/modules/ecommerce/types/page-edit.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        item: function($stateParams, EcommerceTypeModel) {
          return EcommerceTypeModel.get({ _id: $stateParams.id }).$promise;
        }
      }
    })
});

export default appName;