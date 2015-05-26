var appName = 'module.servers.list';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'satellizer',
  'ngTable',
  models
]);

// controllers
import ServersNodesListCtrl from './controllers/ServersNodesListCtrl.js';

module.controller('ServersNodesListCtrl', ServersNodesListCtrl);

// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('servers', {
      abstract: true,
      templateUrl: "views/common/content_small.html"
    })
    .state('servers.list', {
      url: '/servers',
      templateUrl: 'views/modules/servers/page-servers.html',
      controller: 'ServersNodesListCtrl',
      data: {
        pageTitle: 'Users'
      }
    });
});

export default appName;