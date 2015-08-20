export default
  /*@ngInject*/
  function IssuesTypeModel($resource) {
    var resource = $resource('/api/issueTypes/:_id/:method', {
      '_id': '@_id'
    }, {
      'get': {method: 'GET', params: { '_id': '@_id' } },
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });
    resource.prototype.getDate = function() {
      return moment(this.createDate).format('DD MMMM YYYY');
    };
    return resource;
  }
