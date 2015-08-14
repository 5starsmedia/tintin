var appName = 'module.news.models';

var module = angular.module(appName, [
  'ngResource',
  'ngEditableTree'
]);

// models
import NewsPostModel from './NewsPostModel.js';
import NewsCategoryModel from './NewsCategoryModel.js';

module.factory('NewsPostModel', NewsPostModel)
      .factory('NewsCategoryModel', NewsCategoryModel);

export default appName;