var appName = 'module.voting.polls';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  'satellizer',
  'sticky',
  models
]);

// controllers
import VotingPollsCtrl from './controllers/VotingPollsCtrl.js';
import VotingPollEditCtrl from './controllers/VotingPollEditCtrl.js';
import VotingChoiseEditCtrl from './controllers/VotingChoiseEditCtrl.js';

module.controller('VotingPollsCtrl', VotingPollsCtrl)
  .controller('VotingPollEditCtrl', VotingPollEditCtrl)
  .controller('VotingChoiseEditCtrl', VotingChoiseEditCtrl);


// config
module.config(function ($stateProvider) {
  $stateProvider
    .state('voting', {
      abstract: true,
      parent: 'cabinet',
      template: '<div ui-view></div>'
    })
    .state('voting.polls', {
      url: "/polls",
      controller: 'VotingPollsCtrl',
      templateUrl: "views/modules/voting/page-list.html",
      data: {
        pageTitle: 'News',
        hideTitle: true
      }
    })
    .state('voting.create', {
      url: "/polls/new",
      controller: 'VotingPollEditCtrl',
      templateUrl: "views/modules/voting/page-edit.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        item: ($stateParams, $q, PollModel) => {
          var defer = $q.defer();

          defer.resolve(new PollModel({
          }));
          return defer.promise;
        }
      }
    })
    .state('voting.edit', {
      url: "/polls/:id",
      controller: 'VotingPollEditCtrl',
      templateUrl: "views/modules/voting/page-edit.html",
      data: {
        pageTitle: 'News',
        pageDesc: 'Test',
        hideTitle: true
      },
      resolve: {
        item: function($stateParams, PollModel) {
          return PollModel.get({ _id: $stateParams.id }).$promise;
        }
      }
    })
});

export default appName;