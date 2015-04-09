export default
  /*@ngInject*/
  function EcommerceFieldModel($resource) {
    var resource = $resource('/api/productFields/:_id', { '_id': '@_id' }, {
      'save': { method: 'PUT'},
      'create': { method: 'POST'},
      'delete': { method: 'DELETE'}
    });
    return resource;
  }