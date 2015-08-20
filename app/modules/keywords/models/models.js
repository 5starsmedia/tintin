var appName = 'module.keywords.models';

var module = angular.module(appName, [
  'ngResource'
]);

// models
import KeywordsGroupModel from './KeywordsGroupModel.js';
import KeywordsUrlPreview from './KeywordsUrlPreview.js';
import KeywordsTextUniqueModel from './KeywordsTextUniqueModel.js';
import KeywordsSeoTaskModel from './KeywordsSeoTaskModel.js';
import KeywordsSeoStatHistoryModel from './KeywordsSeoStatHistoryModel.js';

module.factory('KeywordsGroupModel', KeywordsGroupModel)
      .factory('KeywordsUrlPreview', KeywordsUrlPreview)
      .factory('KeywordsTextUniqueModel', KeywordsTextUniqueModel)
      .factory('KeywordsSeoTaskModel', KeywordsSeoTaskModel)
      .factory('KeywordsSeoStatHistoryModel', KeywordsSeoStatHistoryModel);

export default appName;