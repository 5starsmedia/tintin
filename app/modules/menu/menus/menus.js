var appName = 'module.menu.menus';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'satellizer',
  'ngTable',
  'ngCkeditor',
  'ui.select',
  'ngSanitize',
  'sticky',
  models
]);

// controllers
import MenuMenusCtrl from './controllers/MenuMenusCtrl.js';
import MenuElementsEditCtrl from './controllers/MenuElementsEditCtrl.js';

module.controller('MenuMenusCtrl', MenuMenusCtrl)
  .controller('MenuElementsEditCtrl', MenuElementsEditCtrl);


// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('menu', {
      abstract: true,
      templateUrl: "views/common/content_small.html"
    })
    .state('menu.menus', {
      url: "/menu",
      controller: 'MenuMenusCtrl',
      templateUrl: "views/modules/menu/page-menus.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      }
    })
    .state('menu.menus.edit', {
      url: "/menu/:id",
      controller: 'MenuElementsEditCtrl',
      templateUrl: "views/modules/menu/block-menu.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        menu: function($stateParams, MenuElementModel) {
          return MenuElementModel.get({ _id: $stateParams.id }).$promise;
        }
      }
    })
});

export default appName;