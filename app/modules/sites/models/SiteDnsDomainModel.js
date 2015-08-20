export default
  /*@ngInject*/
  function SiteDnsDomainModel($resource) {
    return $resource('/api/dnsDomains/:_id/:method', {
      '_id': '@_id'
    }, {
      'getCurrent': {method: 'GET', params: { method: 'current' }},
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });
  }
