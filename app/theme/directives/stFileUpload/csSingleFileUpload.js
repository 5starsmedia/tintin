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
        allowedExtensions: '@',
        bestWidth: '@',
        bestHeight: '@',
        loading: '='
      },
      controller: /*@ngInject*/ ($scope, $auth, $timeout, $log) => {
        $scope.file = $scope.file || {};

        $scope.getStr = function () {
          return '(' + $scope.bestWidth + 'px x ' + $scope.bestHeight + 'px)';
        };

        $scope.url = {
          imageUrl: (_id, opts) => {
            if (!_id) {return null;}
            opts = angular.extend({}, opts);
            var allowedQuery = _.pick(opts, ['width', 'height']);
            var queryStr = _.map(allowedQuery, (val, key) => { return key + '=' + encodeURIComponent(val); }).join('&');

            return '/api/files/' + _id + (queryStr && queryStr.length > 0 ? '?' + queryStr : '');
          }
        };

        $scope.getSettings = function () {
          var headers = {
            'Authorization': 'Bearer ' + $auth.getToken()
          };
          var opts = {
            //target: '/api/keywordProjects',
            headers: headers,
            simultaneousUploads: 1,
            singleFile: true,
            query: { isTemp: true }
          };
          return opts;
        };
        $scope.fileError = function (event, $flow, flowFile, $message) {
          $log.error($message);
        };
        $scope.fileAdded = function (event, $flow, flowFile) {
          var allowedExtensions = $scope.allowedExtensions.split(',');//{xmind: 1,txt:1};
          var ext = flowFile.getExtension().toLowerCase();
          if (_.indexOf(allowedExtensions, ext) == -1) {
            var msgExt = 'Unsupported file extension ' + ext + ' (allowed ' + allowedExtensions.join(',') + ')';
            $log.error(msgExt);
            return false;
          }
          if (flowFile.size > 10 * 1024 * 1024) {
            var msgSize = 'File ' + flowFile.name + ' is too big - ' + flowFile.size + ' bytes (max allowed 10Mb)';
            $log.error(msgSize);
            return false;
          }
          $scope.$apply(() => {
            $scope.loading = true;
          });
          return true;
        };
        $scope.fileSuccess = function (event, flow, file) {
          flow.removeFile(file);
          $scope.loading = false;
          let file = JSON.parse(_.last(file.chunks).xhr.response);
          $scope.file = {
            _id: file['file._id'],
            title: file['file.title']
          };
        };
      }
    };
  }