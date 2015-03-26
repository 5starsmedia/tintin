export default
  /*@ngInject*/
  function EcommerceProductFieldModel($resource) {
    var resource = new $resource('/api/ecommerce/product-fields/:_id', {'_id': '@_id'}, {
      saveFields: { method: 'POST', isArray: true }
    });

    resource.FIELD_TYPE_BOOL       = 1;
    resource.FIELD_TYPE_STRING     = 2;
    resource.FIELD_TYPE_NUMBER     = 3;
    resource.FIELD_TYPE_SET        = 4;
    resource.FIELD_TYPE_BOOLSET    = 5;
    resource.FIELD_TYPE_SEPARATOR  = 6;

    return resource;
  }