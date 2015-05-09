export default
  /*@ngInject*/
  function (WikiPageModel) {
    return {
      restrict: 'A',
      scope: {
        'pageAlias': '=stWikiPage'
      },
      templateUrl: 'app/modules/wiki/pages/directives/stWikiPage.html',
      link: function (scope) {
        scope.$watch('pageAlias', (page) => {
          if (angular.isUndefined(page)) {
            return;
          }
          var alias = page;

          WikiPageModel.get({ alias: alias }, (page) => {
            scope.page = page;
          }, (err) => {
            scope.page = new WikiPageModel({
              title: alias,
              alias: alias,
              body: '[Создать страницу](wiki/' + alias + '/edit)'
            });
          });
        })
      }
    };
  }