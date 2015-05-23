export default
  /*@ngInject*/
  function NewsPostModel($resource) {
    var resource = $resource('/api/posts/:_id/:method', {
      '_id': '@_id'
    }, {
      'get': {method: 'GET', params: { fields: 'id,title,alias,body,seo,category,status,tags,source,files,coverFile,createDate,isAllowComments,photoSource,ownPhoto,isTop,isHighlight,meta,keywords,keywordGroup' }},
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });
    resource.prototype.getDate = function() {
      return moment(this.createDate).format('DD MMMM YYYY');
    };
    return resource;
  }
