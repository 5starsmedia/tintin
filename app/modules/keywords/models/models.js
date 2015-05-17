var appName = 'module.keywords.models';

var module = angular.module(appName, [
  'ngResource'
]);

// models
import KeywordsProjectModel from './KeywordsProjectModel.js';
import KeywordsGroupModel from './KeywordsGroupModel.js';
import KeywordsUrlPreview from './KeywordsUrlPreview.js';
import KeywordsTextUniqueModel from './KeywordsTextUniqueModel.js';

module.factory('KeywordsProjectModel', KeywordsProjectModel)
      .factory('KeywordsGroupModel', KeywordsGroupModel)
      .factory('KeywordsUrlPreview', KeywordsUrlPreview)
      .factory('KeywordsTextUniqueModel', KeywordsTextUniqueModel);

export default appName;