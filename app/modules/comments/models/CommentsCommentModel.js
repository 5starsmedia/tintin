export default
  /*@ngInject*/
  function CommentsCommentModel($resource) {
    var resource = $resource('/api/comments/:_id/:method', {
      '_id': '@_id'
    }, {
      'get': { method: 'GET' },
      'getForModerate': { method: 'GET', isArray: true, params: { method: 'moderate' } },
      'save': { method: 'PUT' },
      'create': { method: 'POST' }
    });
    resource.prototype.getDate = function() {
      return moment(this.createDate).format('DD MMMM YYYY');
    };
    return resource;
  }
