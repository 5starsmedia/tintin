export default
  /*@ngInject*/
  function () {

    return {
      templateUrl: function (elem, attrs) {
        if (attrs.compactMode) {
          return 'app/theme/directives/stFileUpload/csFileUploadCompact.html';
        }
        return 'app/theme/directives/stFileUpload/csFileUpload.html';
      },
      restrict: 'EA',
      replace: true,
      transclude: true,
      scope: {
        'resourceId': '@',
        'collectionName': '@',
        'onFileSelect': '&',
        'hasFileSelect': '@',
        'hasCoverSelect': '@',
        'files': '=',
        'coverFile': '='
      },
      controller: function ($scope, $timeout, $log, $auth) {
        $scope.getSettings = function () {
          var headers = {
            'Authorization': 'Bearer ' + $auth.getToken()
          };
          //headers[CS_AUTH_HEADER] = authSvc.getAuth().token;

          return {
            headers: headers,
            query: (!$scope.resourceId || !$scope.collectionName)
              ? {isTemp: true}
              : {resourceId: $scope.resourceId, collectionName: $scope.collectionName}
          };
        };
        $scope.fileError = function (event, $flow, flowFile, $message) {
          $log.error($message);
          //trackSvc.trackEvent('upload', 'error', 'upload.error.serverError', $message);
          //interactionSvc.warnAlert('Error', $message);
        };
        $scope.fileAdded = function (event, $flow, flowFile) {
          var allowedExtensions = {png: 1, gif: 1, jpg: 1, jpeg: 1};
          var ext = flowFile.getExtension().toLowerCase();
          if (!allowedExtensions[ext]) {
            var msgExt = 'Unsupported file extension ' + ext + ' (allowed png, gif, jpg, jpeg)';
            $log.error(msgExt);
            //interactionSvc.warnAlert('Error', msgExt);
            //trackSvc.trackEvent('upload', 'error', 'upload.error.invExt', ext);
            return false;
          }
          if (flowFile.size > 10 * 1024 * 1024) {
            var msgSize = 'File ' + flowFile.name + ' is too big - ' + flowFile.size + ' bytes (max allowed 10Mb)';
            $log.error(msgSize);
            //trackSvc.trackEvent('upload', 'error', 'upload.error.tooBig', flowFile.size);
            //interactionSvc.warnAlert('Error', msgSize);
            return false;
          }
          return true;
        };
        $scope.fileRemove = function ($event, fileId) {
          $event.preventDefault();
          if ($scope.coverFile._id == fileId) {
            $scope.coverFile = { _id: null };
          }
          _.remove($scope.files, {_id: fileId});
        };
        $scope.setAsCover = function ($event, file) {
          $event.preventDefault();
          $scope.coverFile = file;
        };
        $scope.fileSuccess = function (event, flow, file) {
          flow.removeFile(file);
          var fileId = JSON.parse(_.first(file.chunks).xhr.response)['file._id'];
          $scope.files = $scope.files || [];
          $scope.files.push({_id: fileId});
          $log.debug('File ' + fileId + ' uploaded');
          //trackSvc.trackEvent('upload', 'success', 'upload.success');
        };
      }
    };
  }