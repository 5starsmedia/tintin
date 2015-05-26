export default
  /*@ngInject*/
  () => {


    // ACTIVITY INDICATOR

    var activityIndicatorOn = function()
      {
        $( '<div id="imagelightbox-loading"><div></div></div>' ).appendTo( 'body' );
      },
      activityIndicatorOff = function()
      {
        $( '#imagelightbox-loading' ).remove();
      },


    // OVERLAY

      overlayOn = function()
      {
        $( '<div id="imagelightbox-overlay"></div>' ).appendTo( 'body' );
      },
      overlayOff = function()
      {
        $( '#imagelightbox-overlay' ).remove();
      },


    // CLOSE BUTTON

      closeButtonOn = function( instance )
      {
        $( '<button type="button" id="imagelightbox-close" title="Close"></button>' ).appendTo( 'body' ).on( 'click touchend', function(){ $( this ).remove(); instance.quitImageLightbox(); return false; });
      },
      closeButtonOff = function()
      {
        $( '#imagelightbox-close' ).remove();
      },


    // CAPTION

      captionOn = function()
      {
        var description = $( 'a[href="' + $( '#imagelightbox' ).attr( 'src' ) + '"] img' ).attr( 'alt' );
        if( description && description.length > 0 )
          $( '<div id="imagelightbox-caption">' + description + '</div>' ).appendTo( 'body' );
      },
      captionOff = function()
      {
        $( '#imagelightbox-caption' ).remove();
      };

    return {
      restrict: 'A',
      replace: false,
      scope: false,
      link: (scope, element, attrs) => {
        scope.$evalAsync(() => {
          let images = element.find('img').filter((index, el) => {
            var element = $(el),
              isParentA = element.parent().is('a');
            if (element.data('image-with-preview') && !isParentA) {
              element.wrap('<a target="_blank" href="' + element.attr('src') + '"></a>');
              return true;
            }
            return isParentA;
          }).map((i, el) => {
            return $(el).parent().get(0);
          });
          images.imageLightbox({
            allowedTypes: '',
            onStart:		function() { overlayOn(); closeButtonOn( images ); },
            onEnd:			function() { overlayOff(); captionOff(); closeButtonOff(); activityIndicatorOff(); },
            onLoadStart: 	function() { captionOff(); activityIndicatorOn(); },
            onLoadEnd:	 	function() { captionOn(); activityIndicatorOff(); $( '.imagelightbox-arrow' ).css( 'display', 'block' ); }
          });
        });
      }
    };
  }