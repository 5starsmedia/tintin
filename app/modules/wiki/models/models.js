var appName = 'module.wiki.models';

var module = angular.module(appName, [
  'ngResource'
]);

// models
import WikiPageModel from './WikiPageModel.js';

module.factory('WikiPageModel', WikiPageModel);

export default appName;