export default
  /*@ngInject*/
  function EcommerceReviewModel($resource) {
    var resource = $resource('/api/product-reviews/:_id', { '_id': '@_id' }, {
      '$delete': { method: 'DELETE'}
    });
    return resource;
  }