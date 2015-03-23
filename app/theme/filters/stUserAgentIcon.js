//stUserAgentIcon
export default
  /*@ngInject*/
  function () {
    return function (input) {
      input = input.toLowerCase().replace(' ', '-');
      return 'assets/images/clients/' + input + '.png';
    };
  };