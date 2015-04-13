var appName = 'module.news.categories';

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
import NewsEditCategoryCtrl from './controllers/NewsEditCategoryCtrl.js';
import NewsCategoriesCtrl from './controllers/NewsCategoriesCtrl.js';

module.controller('NewsEditCategoryCtrl', NewsEditCategoryCtrl)
  .controller('NewsCategoriesCtrl', NewsCategoriesCtrl);


module.config(function ($stateProvider) {
  $stateProvider
    .state('news.categories', {
      url: "/news-categories",
      controller: 'NewsCategoriesCtrl',
      templateUrl: "views/modules/news/categories/page-list.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      }
    })
    .state('news.categories.edit', {
      url: "/:id",
      controller: 'NewsEditCategoryCtrl',
      templateUrl: "views/modules/news/categories/page-edit.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        item: function($stateParams, NewsCategoryModel) {
          return NewsCategoryModel.get({ _id: $stateParams.id }).$promise;
        }
      }
    })
});

export default appName;