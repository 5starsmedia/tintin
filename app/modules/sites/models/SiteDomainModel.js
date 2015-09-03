export default
  /*@ngInject*/
  function SiteDomainModel($resource) {
    let resource = $resource('/api/sites/:_id/:method', {
      '_id': '@_id'
    }, {
      'getCurrent': {method: 'GET', params: { method: 'current' }},
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });

    resource.prototype.getUrl = function() {
      let url = this.isHttps ? 'https://' : 'http://';

      url += this.domain;

      if (this.port != 80) {
        url += ':' + this.port;
      }
      return url;
    };
    return resource;
  }
