//stUserAgentIcon
export default
  /*@ngInject*/
  function () {
    return function (input) {
      input = (input || '').toLowerCase().replace(' ', '-');
      if (!input) {
        return;
      }
      return 'assets/images/clients/' + input + '.png';
    };
  };