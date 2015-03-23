export default
  /*@ngInject*/
  function UserAccountModel($resource) {
    return $resource('/api/accounts/:_id', {
      '_id': '@_id'
    }, {
      'getAccountInfo': {
        method: 'GET',
        params: {
          'fields': 'title,username,imageUrl'
        }
      }
    });
  }
