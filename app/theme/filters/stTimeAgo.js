//stTimeAgo
export default
  /*@ngInject*/
  function () {
    return function (input) {
      if (input) {
        return moment(input).fromNow();
      }
      return '';
    };
  };