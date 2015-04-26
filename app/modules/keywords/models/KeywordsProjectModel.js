export default
  /*@ngInject*/
  function KeywordsProjectModel($resource) {
    var resource = $resource('/api/keywordProjects/:_id', {
      '_id': '@_id'
    }, {
      'get': {method: 'GET', params: { fields: 'title,createDate' }},
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });
    return resource;
  }
