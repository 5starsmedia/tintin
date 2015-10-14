export default
  /*@ngInject*/
  function KeywordsPublicationModel($resource) {
    var resource = $resource('/api/publicationSpecifications/:_id/:method', {
      '_id': '@_id'
    }, {
      'get': {method: 'GET', params: { }},
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });
    return resource;
  }
