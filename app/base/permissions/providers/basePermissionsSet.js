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
      var currentPermissions = angular.fromJson(localStorage.permissions || 'null');

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
        getPermissions: (callback) => {
          var defer = $q.defer();
          defer.promise.then(callback || angular.noop);
          BasePermissionModel.getUserSet(function (data) {
            defer.resolve(data);
          }, function () {
            defer.resolve([]);
          });
          return defer.promise;
        },
        getCurrent: (callback) => {
          var defer = $q.defer();
          defer.promise.then(callback || angular.noop);
          if (currentPermissions != null) {
            $log.debug('Return cached permissions', currentPermissions);
            defer.resolve(currentPermissions);
            return defer.promise;
          }
          $log.debug('Load new permissions');

          service.getPermissions((permissions) => {
            currentPermissions = permissions;
            $log.debug('Return new permissions', permissions);
            localStorage.permissions = angular.toJson(permissions);
            defer.resolve(permissions);
          });
          return defer.promise;
        }
      };
      service.getPermissions((permissions) => {
        currentPermissions = permissions;
        localStorage.permissions = angular.toJson(permissions);
      });
      return service;
    };
  }