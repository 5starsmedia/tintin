var appName = 'module.ads.models';

var module = angular.module(appName, [
  'ngResource'
]);

// models
import AdsCodeModel from './AdsCodeModel.js';

module.factory('AdsCodeModel', AdsCodeModel);

export default appName;