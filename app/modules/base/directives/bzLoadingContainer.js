export default /*@ngInject*/ function bzLoadingContainer($window, $timeout) {
  return {
    restrict: 'A',
    scope: false,
    link: function(scope, element, attrs) {
      var loadingLayer = angular.element(document.createElement('div')).addClass('bz-loading-overlay bz-loading ng-hide'),
        spinnerDiv = angular.element(document.createElement('div')).addClass('fa fa-refresh fa-spin fa-2x');

      element.addClass('bz-loading-container').append(loadingLayer);
      scope.$watch(attrs.bzLoadingContainer, function(value) {
        loadingLayer.toggleClass('ng-hide', !value);

        $timeout(function() {
          scrolling();
        }, 1000);
      });

      loadingLayer.append(spinnerDiv);

      var $w = angular.element($window);
      $w.bind('scroll', scrolling);
      $w.bind('resize', scrolling);
      scope.$on('$destroy', function() {
        $w.unbind('scroll', scrolling);
        $w.unbind('resize', scrolling);
      });

      $timeout(function() {
        scrolling();
      }, 100);

      function scrolling() {
        var imgHeight = 32,
          rect = element[0].getBoundingClientRect(),
          scrollTop = window.scrollY,
          scrollBot = scrollTop + window.innerHeight,
          elTop = rect.top + ( window.pageYOffset || document.body.scrollTop )  - ( document.body.clientTop  || 0 ),
          elBottom = elTop + rect.height,
          visibleTop = elTop < scrollTop ? scrollTop : elTop,
          visibleBottom = elBottom > scrollBot ? scrollBot : elBottom;

        var chBottom = visibleBottom - elBottom,
          chTop = visibleTop - elTop,
          imgTop = Math.floor((rect.height + chBottom + chTop - imgHeight) / 2);

        spinnerDiv.css('top', imgTop + 'px');
      }
    }
  }
}