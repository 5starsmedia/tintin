export default
class VotingPollsCtrl {

  /*@ngInject*/
  constructor($scope, NgTableParams, PollModel, BaseAPIParams) {


    $scope.tableParams = new NgTableParams({
      page: 1,
      count: 10,
      sorting: {
        createDate: 'desc'
      }
    }, {
      getData: function ($defer, params) {
        $scope.loading = true;
        PollModel.query(BaseAPIParams({}, params), function (polls, headers) {
          $scope.loading = false;
          $scope.polls = polls;
          $defer.resolve(polls);
          params.total(headers('x-total-count'));
        });
      }
    });

    $scope.remove = function(item) {
      $scope.loading = true;
      item.$delete(function() {
        $scope.loading = false;

        $scope.tableParams.reload();
      })
    };

  }
}