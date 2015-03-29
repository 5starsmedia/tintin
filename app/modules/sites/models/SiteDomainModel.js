export default
  /*@ngInject*/
  function SiteDomainModel($resource) {
    return $resource('/api/sites/:_id', {
      '_id': '@_id'
    }, {
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });
  }
