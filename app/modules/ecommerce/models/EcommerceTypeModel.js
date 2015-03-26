export default
  /*@ngInject*/
  function EcommerceTypeModel($resource) {
    var resource = $resource('/api/product-types/:id', { 'id': '@id' }, {
      '$delete': { method: 'DELETE'}
    });
    return resource;
  }