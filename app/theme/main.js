let appName = 'theme';

let module = angular.module(appName, [
  'satellizer',
  'flow'
]).config((flowFactoryProvider) =>{
  flowFactoryProvider.defaults = {
    uploadMethod: 'POST',
    method: 'multipart',
    target: '/api/upload',
    testChunks: false,
    simultaneousUploads: 5,
    generateUniqueIdentifier: function (file) {
      var relativePath = file.relativePath || file.webkitRelativePath || file.fileName || file.name;
      return Date.now().toString(16) + '-' + file.size.toString(16) + '-' + relativePath;
    }
  };
}).run((notify) => {
  notify.config({
    templateUrl: 'views/common/notify.html',
    duration: 2000
  });
});


import stForm from './directives/stForm/stForm.js';
import stFormElement from './directives/stFormElement/stFormElement.js';
import stChecklistItem from './directives/stChecklistItem/stChecklistItem.js';
import stConfirm from './directives/stConfirm/stConfirm.js';

import csFileUpload from './directives/stFileUpload/csFileUpload.js';
import csFilesList from './directives/stFileUpload/csFilesList.js';
import csSingleFileUpload from './directives/stFileUpload/csSingleFileUpload.js';

module.directive('stForm', stForm)
      .directive('stFormElement', stFormElement)
      .directive('stConfirm', stConfirm)
      .directive('stChecklistItem', stChecklistItem);


module.directive('csFileUpload', csFileUpload);
module.directive('csFilesList', csFilesList);
module.directive('csSingleFileUpload', csSingleFileUpload);
module.directive('uiSelectSearch', () => {
  return {
    restrict: 'C',
    replace: false,
    link: function (scope, element) {
      $(element).keydown(function(e) {
          if(e.keyCode == 13) {
            e.preventDefault();
            return false;
          }
        });
    }
  }
});

import stTimeAgo from './filters/stTimeAgo.js';
import stDialogDate from './filters/stDialogDate.js';
import stUserAgentIcon from './filters/stUserAgentIcon.js';

module.filter('stTimeAgo', stTimeAgo)
  .filter('stUserAgentIcon', stUserAgentIcon)
  .filter('stDialogDate', stDialogDate);

export default appName;