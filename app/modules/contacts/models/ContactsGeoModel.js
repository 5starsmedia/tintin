export default
  /*@ngInject*/
  function ContactsGeoModel($resource) {
    var resource = $resource('/api/contactsGeo/:_id', { '_id': '@_id' }, {
      'save': { method: 'PUT'},
      'create': { method: 'POST'},
      'delete': { method: 'DELETE'}
    });
    return resource;
  }