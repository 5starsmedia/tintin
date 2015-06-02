export default
  /*@ngInject*/
  function ConstructorStateModel(ngNestedResource) {
    var resource = ngNestedResource('/api/states/:_id/:method', { '_id': '@_id' }, {
      'getAsTree': {method: 'GET', params: { method: 'tree' }},
      'save': { method: 'PUT'},
      'delete': { method: 'DELETE'}
    }, {
      'nestedField': 'children'
    });
    return resource;
  }
