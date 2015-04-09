export default
  /*@ngInject*/
  function MenuElementModel(ngNestedResource) {
    var resource = ngNestedResource('/api/menuElements/:_id/:method', { '_id': '@_id' }, {
      'getAsTree': {method: 'GET', params: { method: 'tree' }},
      'save': { method: 'PUT'},
      'newMenu': { method: 'POST'},
      'delete': { method: 'DELETE'}
    }, {
      'nestedField': 'children'
    });
    return resource;
  }