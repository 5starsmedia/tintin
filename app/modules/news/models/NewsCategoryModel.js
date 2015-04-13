export default
  /*@ngInject*/
  function NewsCategoryModel(ngNestedResource) {
    var resource = ngNestedResource('/api/categories/:_id/:method', { '_id': '@_id' }, {
      'getAsTree': {method: 'GET', params: { method: 'tree' }},
      'save': { method: 'PUT'},
      'delete': { method: 'DELETE'}
    }, {
      'nestedField': 'children'
    });
    return resource;
  }
