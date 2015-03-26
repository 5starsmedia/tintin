export default
  /*@ngInject*/
  function EcommerceBrandModel($resource) {
    var resource = $resource('/api/productBrands/:id', { 'id': '@id' }, {
      '$delete': { method: 'DELETE'}
    });
    return resource;
  }