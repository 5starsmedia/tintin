export default
  /*@ngInject*/
  function EcommerceBrandModel($resource) {
    var resource = $resource('/api/productBrands/:_id', { '_id': '@_id' }, {
      'save': { method: 'PUT'},
      'create': { method: 'POST'},
      'delete': { method: 'DELETE'}
    });
    return resource;
  }