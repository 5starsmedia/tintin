//stDialogDate
export default
  /*@ngInject*/
  function () {
    return function (input) {
      if (!input) { return ''; }
      var m = moment(input);
      return moment().startOf('day').diff(moment(input).startOf('day'), 'days') > 0
        ? m.format('MMM D, YYYY HH:mm')
        : m.format('HH:mm');
    };
  };