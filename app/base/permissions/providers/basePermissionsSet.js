import {} from '../helpers/diff.js';

export default
  /*@ngInject*/
  function basePermissionsSet() {
    // @todo add tests
    this.access = function () {
      var checkPermissions = Array.prototype.slice.call(arguments);

      return /*@ngInject*/ function ($q, $log, basePermissionsSet) {
        var defer = $q.defer();
        basePermissionsSet.checkPermission(checkPermissions, (permissions) => {
          defer.resolve(permissions);
        }, (error) => {
          defer.reject(error);
        });
        return defer.promise;
      };
    };

    this.$get = /*@ngInject*/ function ($rootScope, $q, $log, BasePermissionModel, $timeout, $state, $auth) {
      var currentPermissions = null;

      var service = {
        clearCache: function () {
          currentPermissions = null;
        },
        hasPermission: (checkPermissions) => {
          var allowed = false,
            permissions = currentPermissions || [];

          for (var i = 0, diff = []; i < checkPermissions.length; i++) {
            if (!angular.isArray(checkPermissions[i])) {
              checkPermissions[i] = [checkPermissions[i]];
            }

            diff = checkPermissions[i].diff(permissions || []);
            allowed = (!diff.length);
            if (allowed) { break; }
          }
          return checkPermissions.length == 0 || allowed;
        },
        checkPermission: (checkPermissions, success, error) => {
          service.getCurrent(function (permissions) {
            $log.debug('Compare permissions', permissions, checkPermissions);

            if (service.hasPermission(checkPermissions)) {
              success(checkPermissions);
            } else {
              $log.debug('User haven\'t permissions');
              //$rootScope.$emit('$user:pemissionDenied', diff);
              error({
                'status': '403',
                'message': 'Permission denied',
                'requiredPermissions': checkPermissions,
                'currentPermissions': permissions
              });
            }
          });
        },
        getCurrent: function (success) {
          var defer = $q.defer();
          if (success) {
            defer.promise.then(success);
          }
          if (currentPermissions != null) {
            $log.debug('Return cached permissions', currentPermissions);
            defer.resolve(currentPermissions);
            return defer.promise;
          }
          $log.debug('Load new permissions');

          BasePermissionModel.getUserSet(function (data) {
            currentPermissions = data;
            $log.debug('Return new permissions', currentPermissions);
            defer.resolve(currentPermissions);
          }, function () {
            currentPermissions = [];
            defer.resolve(currentPermissions);
          });
          return defer.promise;
        }
      };
      return service;
    };
  }