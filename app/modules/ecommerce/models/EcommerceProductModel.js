export default
  /*@ngInject*/
  function EcommerceProductModel($resource) {
    var resource = $resource('/api/products/:_id/:method', { '_id': '@_id' }, {
      'save': { method: 'PUT'},
      'create': { method: 'POST'},
      'delete': { method: 'DELETE'},
      'deleteVariation': { method: 'DELETE', params: { method: 'variation' } },
      'search': { method: 'GET', isArray: true }
    });
    return resource;
  }