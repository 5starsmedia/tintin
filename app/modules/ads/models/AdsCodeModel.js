export default
  /*@ngInject*/
  function AdsCodeModel($resource) {
    return $resource('/api/adsCodes/:_id/:method', {
      '_id': '@_id'
    }, {
      'delete': {method: 'DELETE'},
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });
  }
