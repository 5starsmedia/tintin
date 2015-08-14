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

var postType = ['news', 'post', 'page', 'announce'];

module.config(function ($stateProvider) {
  _.forEach(postType, (type) => {
    $stateProvider
      .state(type + '.categories', {
        url: '/' + type + '-categories',
        controller: 'NewsCategoriesCtrl',
        templateUrl: "views/modules/news/categories/page-list.html",
        data: {
          pageTitle: 'News',
          pageDesc: 'Test',
          hideTitle: true
        },
        resolve: {
          postType: () => type
        }
      })
      .state(type + '.categories.edit', {
        url: "/:id",
        controller: 'NewsEditCategoryCtrl',
        templateUrl: "views/modules/news/categories/page-edit.html",
        data: {
          pageTitle: 'News',
          pageDesc: 'Test',
          hideTitle: true
        },
        resolve: {
          postType: () => type,
          item: function ($stateParams, NewsCategoryModel) {
            return NewsCategoryModel.get({_id: $stateParams.id}).$promise;
          }
        }
      });
  });
});

export default appName;