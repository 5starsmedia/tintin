export default
  /*@ngInject*/
  function SiteRedirectModel($resource) {
    let resource = $resource('/api/redirects/:_id/:method', {
      '_id': '@_id'
    }, {
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });
    return resource;
  }
