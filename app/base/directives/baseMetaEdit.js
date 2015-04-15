export default
  /*@ngInject*/
  function baseMetaEdit($window, $timeout) {
    return {
      restrict: 'A',
      scope: {
        'item': '=baseMetaEdit'
      },
      templateUrl: 'views/modules/base/directive-baseMetaEdit.html',
      link: function (scope, element, attrs) {
        scope.$watch('item', (item) => {
          if (angular.isUndefined(item)) {
            return;
          }
          item.meta = item.meta || {};
        });
      }
    }
  }