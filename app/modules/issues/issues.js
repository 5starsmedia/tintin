import list from './list/list';
import types from './types/types';
import attachments from './attachments/attachments';

var appName = 'module.issues';

var module = angular.module(appName, [
  types,
  list,
  attachments
]);

export default appName;