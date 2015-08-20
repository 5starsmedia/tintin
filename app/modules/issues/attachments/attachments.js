var appName = 'module.issues.attachments';

import models from '../models/models.js';

let module = angular.module(appName, [
  'base',
  'ui.router',
  models
]);


// controllers
import IssuesAttachmentsCtrl from './controllers/IssuesAttachmentsCtrl.js';

module.controller('IssuesAttachmentsCtrl', IssuesAttachmentsCtrl);

import issueAttachment from './directives/issueAttachment.js';
import issueResourceLink from './directives/issueResourceLink.js';

module.directive('issueAttachment', issueAttachment);
module.directive('issueResourceLink', issueResourceLink);

// config
module.config(() => {
});

export default appName;