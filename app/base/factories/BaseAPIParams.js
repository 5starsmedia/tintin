export default
  /*@ngInject*/
  function BaseAPIParams(obj, params) {

    obj.page = params.page();
    obj.perPage = params.count();

    var orderBy = _.map(params.orderBy(), (item) => {
      return item.replace(/\+/, '');
    });
    obj.sort = orderBy;

    return obj;
  };