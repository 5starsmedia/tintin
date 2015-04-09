export default
  /*@ngInject*/
  function BaseAPIParams(obj, params) {

    obj.page = params.page();
    obj.perPage = params.count();

    var orderBy = _.map(params.orderBy(), (item) => {
      return item.replace(/\+/, '');
    });
    obj.sort = orderBy;
    var filter = params.filter();
    _.map(filter, (value, name) => {
      obj[name] = value;
    });

    return obj;
  };