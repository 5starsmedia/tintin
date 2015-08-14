var appName = 'module.voting.models';

var module = angular.module(appName, [
  'ngResource'
]);

// models
import PollModel from './PollModel.js';

module.factory('PollModel', PollModel);

export default appName;