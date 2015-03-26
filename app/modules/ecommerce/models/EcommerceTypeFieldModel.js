export default
  /*@ngInject*/
  function EcommerceTypeFieldModel($resource) {
    var resource = $resource('/api/product-types-fields/:id', { 'id': '@id' }, {
      '$delete': { method: 'DELETE'}
    });
    return resource;
  }