var appName = 'module.users.clients';

import models from '../models/models.js';

let module = angular.module(appName, [
    'base',
    'ui.router',
    'satellizer',
    'ngTable',
    models
]);

// controllers
import UsersClientsListCtrl from './controllers/UsersClientsListCtrl.js';

module.controller('UsersClientsListCtrl', UsersClientsListCtrl);

// config
module.config(function ($stateProvider) {
    $stateProvider
        .state('users.clients', {
            url: '/clients',
            templateUrl: 'views/modules/users/page-clients.html',
            controller: 'UsersClientsListCtrl',
            data: {
                pageTitle: 'Users'
            }
        });
});

export default appName;