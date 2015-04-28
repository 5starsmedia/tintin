export default
  /*@ngInject*/
  function KeywordsGroupModel($resource) {
    var resource = $resource('/api/keywordGroups/:_id', {
      '_id': '@_id'
    }, {
      'get': {method: 'GET', params: { fields: 'title,createDate,keywords,project._id' }},
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });
    return resource;
  }
