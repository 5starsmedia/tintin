export default
  /*@ngInject*/
  function adsHtmlPreview($window, $timeout) {
    return {
      restrict: 'A',
      scope: {
        'html': '=adsHtmlPreview'
      },
      replace: true,
      template: '<iframe class="well" frameborder="0" style="width: 100%; height: 300px; padding: 0" />',
      link: function (scope, element, attrs) {
        scope.$watch('html', (html) => {
          if (angular.isUndefined(html)) {
            return;
          }
          var iframeElementContainer = element[0].contentDocument;
          iframeElementContainer.open();
          iframeElementContainer.writeln(html);
          iframeElementContainer.close();
        });
      }
    }
  }