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


import stAvatar from './directives/stAvatar/stAvatar.js';

import stForm from './directives/stForm/stForm.js';
import stPanel from './directives/stPanel/stPanel.js';
import stHeader from './directives/stHeader/stHeader.js';
import stFormElement from './directives/stFormElement/stFormElement.js';
import stTreeSelect from './directives/stTreeSelect/stTreeSelect.js';
import stChecklistItem from './directives/stChecklistItem/stChecklistItem.js';
import stConfirm from './directives/stConfirm/stConfirm.js';

import csFileUpload from './directives/stFileUpload/csFileUpload.js';
import csFilesList from './directives/stFileUpload/csFilesList.js';
import csSingleFileUpload from './directives/stFileUpload/csSingleFileUpload.js';

import stSyncScroll from './directives/stSyncScroll/stSyncScroll.js';
import stUrlInput from './directives/stUrlInput/stUrlInput.js';

module.directive('stAvatar', stAvatar);

module.directive('stForm', stForm)
      .directive('stPanel', stPanel)
      .directive('stHeader', stHeader)
      .directive('stFormElement', stFormElement)
      .directive('stConfirm', stConfirm)
      .directive('stChecklistItem', stChecklistItem);


module.directive('csFileUpload', csFileUpload);
module.directive('csFilesList', csFilesList);
module.directive('stTreeSelect', stTreeSelect);
module.directive('csSingleFileUpload', csSingleFileUpload);
module.directive('stSyncScroll', stSyncScroll);
module.directive('stUrlInput', stUrlInput);
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