export default
  /*@ngInject*/
  function UserPermissionModel($resource) {
    return $resource('/api/users/permissions/:_id', {
      '_id': '@_id'
    }, {
      'save': { method: 'PUT'},
      'create': { method: 'POST' },
      'delete': { method: 'DELETE'}
    });
  }
