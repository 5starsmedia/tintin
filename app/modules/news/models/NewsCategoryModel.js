export default
  /*@ngInject*/
  function NewsCategoryModel($resource) {
    return $resource('/api/categories/:_id', {
      '_id': '@_id'
    }, {
      'get': {method: 'GET', params: { fields: 'title' }},
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });
  }
