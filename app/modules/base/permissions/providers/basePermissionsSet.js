import {} from '../helpers/diff.js';

export default
  /*@ngInject*/
  function basePermissionsSet() {
    // @todo add tests
    this.access = function () {
      var checkPermissions = Array.prototype.slice.call(arguments);

      return /*@ngInject*/ function ($q, $log, basePermissionsSet) {

        var defer = $q.defer();
        basePermissionsSet.getCurrent(function (permissions) {
          var allowed = false;
          for (var i = 0, diff = []; i < checkPermissions.length; i++) {
            $log.debug('Compare permissions', permissions, checkPermissions[i]);

            diff = checkPermissions[i].diff(permissions || []);
            allowed = (!diff.length);
            if (allowed) {
              break;
            }
          }

          if (checkPermissions.length == 0 || allowed) {
            defer.resolve(checkPermissions);
          } else {
            $log.debug('User haven\'t permissions:', diff);
            //$rootScope.$emit('$user:pemissionDenied', diff);
            defer.reject({
              'status': '403',
              'message': 'Permission denied',
              'diff': diff,
              'requiredPermissions': checkPermissions,
              'currentPermissions': permissions
            });
          }
        });
        return defer.promise;
      };
    };

    this.$get = /*@ngInject*/ function ($rootScope, $q, $log, BasePermissionModel) {
      var currentPermissions = null;

      return {
        clearCache: function () {
          currentPermissions = null;
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
    };
  }