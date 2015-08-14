var appName = 'module.wiki.pages';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'satellizer',
  'Showdown',
  'sticky',
  models
]);


import stWikiPage from './directives/stWikiPage.js';
import stMarkdownIt from './directives/stMarkdownIt.js';
module.directive('stWikiPage', stWikiPage)
  .directive('stMarkdownIt', stMarkdownIt);

// controllers
import WikiPageCtrl from './controllers/WikiPageCtrl.js';
import WikiEditPageCtrl from './controllers/WikiEditPageCtrl.js';

module.controller('WikiPageCtrl', WikiPageCtrl)
  .controller('WikiEditPageCtrl', WikiEditPageCtrl);


// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('wiki', {
      abstract: true,
      parent: 'cabinet',
      template: '<div ui-view></div>'
    })
    .state('wiki.home', {
      url: "/wiki",
      controller: 'WikiPageCtrl',
      templateUrl: "views/modules/wiki/page-page.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        page: function($stateParams, WikiPageModel, $q) {
          let defer = $q.defer();
          WikiPageModel.get({ alias: 'index' }, (page) => {
            defer.resolve(page);
          }, (err) => {
            defer.resolve(new WikiPageModel({
              title: 'Home page',
              alias: 'index',
              body: '[Создать страницу](wiki/index/edit)'
            }));
          });
          return defer.promise;
        }
      }
    })
    .state('wiki.pages', {
      url: "/wiki/:alias",
      controller: 'WikiPageCtrl',
      templateUrl: "views/modules/wiki/page-page.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        page: function($stateParams, WikiPageModel, $q) {
          let defer = $q.defer();
          WikiPageModel.get({ alias: $stateParams.alias }, (page) => {
            defer.resolve(page);
          }, (err) => {
            defer.resolve(new WikiPageModel({
              title: $stateParams.alias,
              alias: $stateParams.alias,
              body: '[Создать страницу](wiki/' + $stateParams.alias + '/edit)'
            }));
          });
          return defer.promise;
        }
      }
    })


    .state('wiki.editPage', {
      url: "/wiki/:alias/edit",
      controller: 'WikiEditPageCtrl',
      templateUrl: "views/modules/wiki/page-edit.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        page: function($stateParams, WikiPageModel, $q) {
          let defer = $q.defer();
          WikiPageModel.get({ alias: $stateParams.alias }, (page) => {
            defer.resolve(page);
          }, (err) => {
            defer.resolve(new WikiPageModel({
              title: $stateParams.alias,
              alias: $stateParams.alias,
              body: '[Создать страницу](wiki/' + $stateParams.alias + '/edit)'
            }));
          });
          return defer.promise;
        }
      }
    })
});

export default appName;