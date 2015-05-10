export default
  /*@ngInject*/
  function KeywordsTextUniqueModel($resource) {
    var resource = $resource('/api/text-unique', {
      '_id': '@_id'
    }, {
      'checkText': {method: 'POST'}
    });
    return resource;
  }
