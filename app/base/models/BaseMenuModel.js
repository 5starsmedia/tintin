export default
  /*@ngInject*/
  function BaseMenuModel($resource) {
    var resource = $resource('/api/cmsMenu', {
      '_id': '@_id'
    }, {
    });
    return resource;
  }
