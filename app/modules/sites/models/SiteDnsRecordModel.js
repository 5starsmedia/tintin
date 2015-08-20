export default
  /*@ngInject*/
  function SiteDnsRecordModel($resource) {
    return $resource('/api/dnsRecords/:_id/:method', {
      '_id': '@_id'
    }, {
      'getCurrent': {method: 'GET', params: { method: 'current' }},
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });
  }
