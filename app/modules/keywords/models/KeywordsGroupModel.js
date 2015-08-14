export default
  /*@ngInject*/
  function KeywordsGroupModel($resource) {
    var resource = $resource('/api/keywordGroups/:_id/:method', {
      '_id': '@_id'
    }, {
      'get': {method: 'GET', params: { fields: 'title,createDate,keywords,project._id,result,status,recomendation,category' }},
      'runScan': {method: 'POST', params: { method: 'run-scan' }},
      'scanKeywords': {method: 'PUT', params: { method: 'scan' }},
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });
    return resource;
  }
