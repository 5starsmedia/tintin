export default
  /*@ngInject*/
  function () {
    return function (str, length) {
      if (!str) { return ''; }
      str = str.replace(/(<([^>]+)>)/ig,"");
      if (str.length > length) {
        var match = str.substring(length - 10, length).match(/\b/);
        if (match) {
          return str.substring(0, length - 10 + match.index - 1) + '...';
        } else {
          return str.substring(0, length) + '...';
        }
      }
      return str;
    };
  };