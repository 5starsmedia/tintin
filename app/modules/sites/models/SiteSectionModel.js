export default
  /*@ngInject*/
  function SiteSectionModel($resource) {
    let resource = $resource('/api/sections/:_id/:method', {
      '_id': '@_id'
    }, {
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });
    return resource;
  }
