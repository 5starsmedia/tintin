export default
  /*@ngInject*/
  function KeywordsUrlPreview($resource) {
    var resource = $resource('/api/crawledUrls', {
      '_id': '@_id'
    }, {
      'getPreview': {method: 'GET'}
    });
    return resource;
  }
