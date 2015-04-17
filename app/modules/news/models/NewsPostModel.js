export default
  /*@ngInject*/
  function NewsPostModel($resource) {
    var resource = $resource('/api/posts/:_id', {
      '_id': '@_id'
    }, {
      'get': {method: 'GET', params: { fields: 'id,title,body,category,status,tags,source,files,coverFile,createDate,isAllowComments,photoSource,ownPhoto,isTop,isHighlight,meta,keywords' }},
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });
    resource.prototype.getDate = function() {
      return moment(this.createDate).format('DD MMMM YYYY');
    };
    return resource;
  }
