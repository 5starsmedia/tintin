export default
  /*@ngInject*/
  function UserRoleModel($resource) {
    return $resource('/api/roles/:_id', {
      '_id': '@_id'
    }, {
      'save': { method: 'PUT'},
      'create': { method: 'POST' },
      'delete': { method: 'DELETE'}
    });
  }
