export default
  /*@ngInject*/
  function PollModel($resource) {
    var resource = $resource('/api/polls/:_id', {
      '_id': '@_id'
    }, {
      'get': {method: 'GET', params: { }},
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });
    return resource;
  }
