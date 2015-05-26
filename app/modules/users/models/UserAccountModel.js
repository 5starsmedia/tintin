export default
  /*@ngInject*/
  function UserAccountModel($resource, $q, basePermissionsSet) {
    var resource = $resource('/api/accounts/:_id/:method', {
      '_id': '@_id'
    }, {
      'getAccountInfo': {
        method: 'GET',
        params: {
          'fields': 'title,username,imageUrl,roles'
        }
      },
      'changeRole': { method: 'PUT', url: '/api/auth/changeRole' },
      'save': { method: 'PUT'},
      'create': { method: 'POST', url: '/api/auth/register' },
      'delete': { method: 'DELETE'}
    });

    resource.prototype.has = function() {
      return basePermissionsSet.hasPermission.call(basePermissionsSet, arguments);
    };
    return resource;
  }
