export default
  /*@ngInject*/
  function EcommerceCategoryModel(ngNestedResource) {
    var resource = ngNestedResource('/api/productCategories/:_id/:method', { '_id': '@_id' }, {
      'getAsTree': {method: 'GET', params: { method: 'tree' }},
      'save': { method: 'PUT'},
      'delete': { method: 'DELETE'}
    }, {
      'nestedField': 'children'
    });
    return resource;
  }