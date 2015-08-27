export default
  /*@ngInject*/
  function KeywordsGroupModel($resource) {
    var resource = $resource('/api/keywordGroups/:_id/:method', {
      '_id': '@_id'
    }, {
      'get': {method: 'GET', params: { fields: 'title,createDate,keywords,result,status,recomendation,category,issue' }},
      'runScan': {method: 'POST', params: { method: 'run-scan' }},
      'scanKeywords': {method: 'PUT', params: { method: 'scan' }},
      'save': {method: 'PUT'},
      'create': {method: 'POST'}
    });
    return resource;
  }
