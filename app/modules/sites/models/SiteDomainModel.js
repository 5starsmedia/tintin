export default
  /*@ngInject*/
  function SiteDomainModel($resource) {
    return $resource('/api/sites/:_id/:method', {
      '_id': '@_id'
    }, {
      'getCurrent': {method: 'GET', params: { method: 'current' }},
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });
  }
