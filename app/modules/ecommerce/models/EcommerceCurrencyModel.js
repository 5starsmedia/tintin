export default
  /*@ngInject*/
  function EcommerceCurrencyModel($resource) {
    var resource = $resource('/api/productCurrencies/:_id', { '_id': '@_id' }, {
      'save': { method: 'PUT'},
      'create': { method: 'POST'},
      'delete': { method: 'DELETE'}
    });
    return resource;
  }