export default
  /*@ngInject*/
  function WikiPageModel($resource) {
    var resource = $resource('/api/wikiPages/:_id', {
      '_id': '@_id'
    }, {
      'get': {method: 'GET', params: { }},
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });
    return resource;
  }
