export default
  /*@ngInject*/
  function ServersNodeServerModel($resource) {
    var resource = $resource('/api/nodeServers/:_id/:method', {
      '_id': '@_id'
    }, {
      'save': { method: 'PUT'},
      'create': { method: 'POST', url: '/api/auth/register' },
      'delete': { method: 'DELETE'}
    });
    return resource;
  }
