export default
  /*@ngInject*/
  function UserAccountModel($resource) {
    return $resource('/api/accounts/:_id/:method', {
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
  }
