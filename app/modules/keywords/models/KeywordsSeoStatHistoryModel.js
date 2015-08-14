export default
  /*@ngInject*/
  function KeywordsSeoStatHistoryModel($resource) {
    var resource = $resource('/api/seoStatHistories/:_id/:method', {
      '_id': '@_id'
    }, {
      'getMonth': { method: 'GET', params: { method: 'month' } } 
    });
    return resource;
  }
