export default
  /*@ngInject*/
  function NewsPostModel($resource) {
    var resource = $resource('/api/posts/:_id/:method', {
      '_id': '@_id'
    }, {
      'get': {method: 'GET'},
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });
    resource.prototype.getDate = function() {
      return moment(this.createDate).format('DD MMMM YYYY');
    };
    return resource;
  }
