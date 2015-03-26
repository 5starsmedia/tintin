export default
  /*@ngInject*/
  function EcommerceProductModel($resource) {
    var resource = $resource('/api/products/:id', { 'id': '@id' }, {
      'updatePrice': { method: 'POST', 'params': { 'id': '@id', 'action': 'updatePrice' } },
      'updateOrder': { method: 'POST', 'params': { 'id': '@id', 'action': 'updateOrder' } },
      'getRelatedProducts': { method: 'GET', 'params': { 'id': '@id', 'action': 'related' } },
      'getNotRelatedProducts': { method: 'GET', 'params': { 'id': '@id', 'action': 'notrelated' } },
      'addRelatedProduct': { method: 'PUT', 'params': { 'id': '@id', 'action': 'related' } },
      'removeRelatedProduct': { method: 'DELETE', 'params': { 'id': '@id', 'action': 'related' } }
    });
    return resource;
  }