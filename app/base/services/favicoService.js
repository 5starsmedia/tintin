export default () => {
  var favico = new Favico({
    animation : 'slide',
    position : 'up'
  });

  var badge = function(num) {
    favico.badge(num);
  };
  var reset = function() {
    favico.reset();
  };

  return {
    badge : badge,
    reset : reset
  };
};