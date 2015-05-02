export default
  /*@ngInject*/
  function KeywordsGroupModel($resource) {
    var resource = $resource('/api/keywordGroups/:_id/:method', {
      '_id': '@_id'
    }, {
      'get': {method: 'GET', params: { fields: 'title,createDate,keywords,project._id,result,status' }},
      'runScan': {method: 'POST', params: { method: 'run-scan' }},
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });
    return resource;
  }
