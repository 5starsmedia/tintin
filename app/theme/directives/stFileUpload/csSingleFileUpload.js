export default
  /*@ngInject*/
  function () {

    return {
      templateUrl: 'app/theme/directives/stFileUpload/csSingleFileUpload.html',
      restrict: 'E',
      replace: true,
      scope: {
        resourceId: '@',
        collectionName: '@',
        file: '=',
        bestWidth: '@',
        bestHeight: '@'
      },
      controller: /*@ngInject*/ ($scope, $timeout, $log) => {
        $scope.file = $scope.file || {};
        $scope.getStr = function(){
          return '(' + $scope.bestWidth + 'px x ' + $scope.bestHeight + 'px)';
        };

        $scope.getSettings = function () {
          var headers = {};
          headers[CS_AUTH_HEADER] = authSvc.getAuth().token;
          return {
            headers: headers,
            singleFile: true,
            query: (!$scope.resourceId || !$scope.collectionName)
              ? {isTemp: true}
              : {resourceId: $scope.resourceId, collectionName: $scope.collectionName}
          };
        };
        $scope.fileError = function (event, $flow, flowFile, $message) {
          $log.error($message);
          trackSvc.trackEvent('upload', 'error', 'upload.error.serverError', $message);
          interactionSvc.warnAlert('Error', $message);
        };
        $scope.fileAdded = function (event, $flow, flowFile) {
          var allowedExtensions = {png: 1, gif: 1, jpg: 1, jpeg: 1};
          var ext = flowFile.getExtension().toLowerCase();
          if (!allowedExtensions[ext]) {
            var msgExt = 'Unsupported file extension ' + ext + ' (allowed png, gif, jpg, jpeg)';
            $log.error(msgExt);
            interactionSvc.warnAlert('Error', msgExt);
            trackSvc.trackEvent('upload', 'error', 'upload.error.invExt', ext);
            return false;
          }
          if (flowFile.size > 10 * 1024 * 1024) {
            var msgSize = 'File ' + flowFile.name + ' is too big - ' + flowFile.size + ' bytes (max allowed 10Mb)';
            $log.error(msgSize);
            trackSvc.trackEvent('upload', 'error', 'upload.error.tooBig', flowFile.size);
            interactionSvc.warnAlert('Error', msgSize);
            return false;
          }
          return true;
        };
        $scope.fileSuccess = function (event, flow, file) {
          flow.removeFile(file);
          var fileId = JSON.parse(_.first(file.chunks).xhr.response)['file._id'];
          $scope.file._id = fileId;
          $log.debug('File ' + fileId + ' uploaded');
          trackSvc.trackEvent('upload', 'success', 'upload.success');
        };
      }
    };
  }