export default /*@ngInject*/ function animatePanel($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {

      //Set defaul values for start animation and delay
      var startAnimation = 0;
      var delay = 0.1;   // secunds
      var start = Math.abs(delay) + startAnimation;

      // Set default values for attrs
      if(!attrs.effect) { attrs.effect = 'zoomIn'};
      if(attrs.delay) { delay = attrs.delay / 10 } else { delay = 0.1 };
      if(!attrs.child) { attrs.child = '.row > div'} else {attrs.child = "." + attrs.child};

      // Get all visible element and set opactiy to 0
      var panel = element.find(attrs.child);
      panel.addClass('opacity-0');

      // Wrap to $timeout to execute after ng-repeat
      $timeout(function(){
        // Get all elements and add effect class
        panel = element.find(attrs.child);
        panel.addClass('animated-panel').addClass(attrs.effect);

        // Add delay for each child elements
        panel.each(function(i, elm) {
          start += delay;
          var rounded = Math.round( start * 10 ) / 10;
          $(elm).css('animation-delay', rounded + 's')
          // Remove opacity 0 after finish
          $(elm).removeClass('opacity-0');
        });
      });

    }
  }
}