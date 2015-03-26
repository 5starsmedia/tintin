export default
  /*@ngInject*/
  function EcommerceCategoryModel($resource) {
    var resource = $resource('/api/productCategories/:id', { 'id': '@id' }, {
      '$delete': { method: 'DELETE'}
    });
    return resource;
  }