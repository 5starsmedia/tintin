export default
  /*@ngInject*/
  function KeywordsSeoTaskModel($resource) {
    var resource = $resource('/api/seoTasks/:_id/:method', {
      '_id': '@_id'
    }, {
      'runTasks': { method: 'POST', params: { method: 'run-tasks', collectionName: '@collectionName', resourceId: '@resourceId' } }
    });
    return resource;
  }
