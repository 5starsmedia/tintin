export default
  /*@ngInject*/
  function (NewsPostModel, $interval) {
    return {
      restrict: 'A',
      replace: true,
      transclude: true,
      scope: true,
      templateUrl: 'views/modules/news/dashboard-creators.html',
      link: function($scope) {

        $scope.reload = () => {
          $scope.loading = true;
          NewsPostModel.getStatistic((data) => {
            $scope.loading = false;
            $scope.statistic = data;
          });
        };
        $scope.reload();

        var timer = $interval($scope.reload, 5000);
        $scope.$on('$destroy', () => {
          $interval.cancel(timer);
        });

      }
    };
  }