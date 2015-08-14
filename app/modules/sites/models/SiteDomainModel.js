export default
  /*@ngInject*/
  function SiteDomainModel($resource) {
    return $resource('/api/sites/:_id/:method', {
      '_id': '@_id'
    }, {
      'getCurrent': {method: 'GET', params: { method: 'current' }},
      'getLocales': {method: 'GET', params: { method: 'locales' }, isArray: true },
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });
  }
