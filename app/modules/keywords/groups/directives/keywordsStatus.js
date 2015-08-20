export default
  /*@ngInject*/
  () => {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'views/modules/keywords/directive-keywordsStatus.html',
      scope: {
        'status': '@keywordsStatus'
      },
      link: function(scope) {
        console.info(scope.status)
      }
    };
  }