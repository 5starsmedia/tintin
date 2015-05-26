export default
  /*@ngInject*/
  function BasePermissionModel($resource) {
    return $resource('/api/auth/permissions', {
      'id': '@id'
    }, {
      getUserSet: {method: 'GET', isArray: true}
    });
  }