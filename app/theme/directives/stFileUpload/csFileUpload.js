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
      controller: /*@ngInject*/ ($scope, $timeout, $log, $auth) => {
        var maxFileSize = 15; // in Mb

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

        $scope.sortableConfig = {
          group: 'fields',
          animation: 150,
          onSort: (event) => {
            _.forEach(event.models, (model, n) => {
              model.ordinal = n;
            });
          }
        };

        $scope.errors = [];
        $scope.fileError = function (event, $flow, flowFile, $message) {
          $log.error($message);

          $scope.errors.push({
            code: 'upload',
            message: $message
          });
          //trackSvc.trackEvent('upload', 'error', 'upload.error.serverError', $message);
          //interactionSvc.warnAlert('Error', $message);
        };
        $scope.fileAdded = function (event, $flow, flowFile) {
          $scope.errors = [];

          var allowedExtensions = {png: 1, gif: 1, jpg: 1, jpeg: 1};
          var ext = flowFile.getExtension().toLowerCase();
          if (!allowedExtensions[ext]) {
            var msgExt = 'Unsupported file extension ' + ext + ' (allowed png, gif, jpg, jpeg)';
            $log.error(msgExt);
            //interactionSvc.warnAlert('Error', msgExt);
            //trackSvc.trackEvent('upload', 'error', 'upload.error.invExt', ext);
            $scope.errors.push({
              code: 'invExt',
              message: msgExt
            });
            return false;
          }
          if (flowFile.size > maxFileSize * 1024 * 1024) {
            var msgSize = 'File ' + flowFile.name + ' is too big - ' + flowFile.size + ' bytes (max allowed ' + maxFileSize + 'Mb)';
            $log.error(msgSize);
            //trackSvc.trackEvent('upload', 'error', 'upload.error.tooBig', flowFile.size);
            //interactionSvc.warnAlert('Error', msgSize);
            $scope.errors.push({
              code: 'invExt',
              message: msgSize
            });
            return false;
          }
          return true;
        };
        $scope.fileRemove = function ($event, fileId) {
          $event.preventDefault();
          if ($scope.coverFile && $scope.coverFile._id == fileId) {
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
          var file = JSON.parse(_.first(file.chunks).xhr.response);
          $scope.files = $scope.files || [];
          $scope.files.push({
            _id: file['file._id'],
            title: file['file.title']
          });
          $log.debug('File ' + file['file._id'] + ' uploaded');
          //trackSvc.trackEvent('upload', 'success', 'upload.success');
        };
      }
    };
  }