export default
  /*@ngInject*/
  function () {
    return {
      restrict: 'A',
      replace: false,
      scope: {
        'tree': '=stTreeSelect',
        'model': '=ngModel'
      },
      templateUrl: 'app/theme/directives/stTreeSelect/stTreeSelect.html',
      link: function (scope, element, attrs) {

        var items, walkItem = (dataItem, level) => {
            _.forEach(dataItem.children, (item) => {
              item.selectTitle = _.repeat('&#8230;', level * 2) + item.title;
              items.push(item);
              walkItem(item, level + 1);
            });
          };

        scope.$watch('tree', (data) => {
          if (angular.isUndefined(data)) {
            return;
          }
          items = [];
          walkItem(data, 0);
          scope.items = items;
        }, true);
      }
    };
}