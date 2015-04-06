export default
  /*@ngInject*/
  function EcommerceProductModel($resource) {
    var resource = $resource('/api/products/:_id', { '_id': '@_id' }, {
      'save': { method: 'PUT'},
      'create': { method: 'POST'},
      'delete': { method: 'DELETE'}
    });
    return resource;
  }