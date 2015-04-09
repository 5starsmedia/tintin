export default
  /*@ngInject*/
  function EcommerceTypeModel(ngNestedResource) {
    var resource = ngNestedResource('/api/productTypes/:_id/:method', {'_id': '@_id'}, {
      'getAsTree': {method: 'GET', params: { method: 'tree' }},
      'save': {method: 'PUT'},
      'delete': {method: 'DELETE'}
    }, {
      'nestedField': 'children'
    });
    return resource;
  }