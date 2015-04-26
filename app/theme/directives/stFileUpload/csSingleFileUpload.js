export default
  /*@ngInject*/
  function () {

    return {
      templateUrl: function (elem, attrs) {
        if (attrs.compactMode) {
          return 'app/theme/directives/stFileUpload/csSingleFileUploadCompact.html';
        }
        return 'app/theme/directives/stFileUpload/csSingleFileUpload.html';
      },
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        file: '=',
        loading: '='
      },
      controller: /*@ngInject*/ ($scope, $auth, $timeout, $log) => {
        $scope.file = $scope.file || {};

        $scope.getSettings = function () {
          var headers = {
            'Authorization': 'Bearer ' + $auth.getToken()
          };
          return {
            target: '/api/keywordProjects',
            headers: headers,
            simultaneousUploads: 1,
            singleFile: true,
            query: { isTemp: true }
          };
        };
        $scope.fileError = function (event, $flow, flowFile, $message) {
          $log.error($message);
        };
        $scope.fileAdded = function (event, $flow, flowFile) {
          var allowedExtensions = {xmind: 1};
          var ext = flowFile.getExtension().toLowerCase();
          if (!allowedExtensions[ext]) {
            var msgExt = 'Unsupported file extension ' + ext + ' (allowed xmind)';
            $log.error(msgExt);
            return false;
          }
          if (flowFile.size > 10 * 1024 * 1024) {
            var msgSize = 'File ' + flowFile.name + ' is too big - ' + flowFile.size + ' bytes (max allowed 10Mb)';
            $log.error(msgSize);
            return false;
          }
          $scope.loading = true;
          return true;
        };
        $scope.fileSuccess = function (event, flow, file) {
          flow.removeFile(file);
          $scope.loading = false;
          $scope.file = JSON.parse(_.last(file.chunks).xhr.response);
        };
      }
    };
  }