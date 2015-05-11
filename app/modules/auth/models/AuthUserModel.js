export default
  /*@ngInject*/
  function AuthUserModel($resource) {
    var resource = $resource('/api/auth/:method', {
      '_id': '@_id'
    }, {
      'sendReset': {method: 'POST', params: { method: 'reset' }},
      'checkResetToken': {method: 'POST', params: { method: 'reset-confirm' }}
    });
    return resource;
  }
