var appName = 'module.keywords.models';

var module = angular.module(appName, [
  'ngResource'
]);

// models
import KeywordsProjectModel from './KeywordsProjectModel.js';
import KeywordsGroupModel from './KeywordsGroupModel.js';

module.factory('KeywordsProjectModel', KeywordsProjectModel)
      .factory('KeywordsGroupModel', KeywordsGroupModel);

export default appName;