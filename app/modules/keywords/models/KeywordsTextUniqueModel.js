export default
  /*@ngInject*/
  function KeywordsTextUniqueModel($resource) {
    var resource = $resource('/api/text-unique/:uid', {
      '_id': '@_id'
    }, {
      'checkText': {method: 'POST'},
      'checkStatus': {method: 'GET', params: { 'uid': '@uid' }}
    });
    return resource;
  }
