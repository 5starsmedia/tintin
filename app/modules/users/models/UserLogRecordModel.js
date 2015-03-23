export default
  /*@ngInject*/
  function UserLogRecordModel($resource) {
    return $resource('/api/logRecords/:_id', {
      '_id': '@_id'
    }, {
    });
  }
