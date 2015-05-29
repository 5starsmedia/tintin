export default
class CommentsCommentsCtrl {
  /*@ngInject*/
  constructor($scope, CommentsCommentModel, BaseAPIParams, NgTableParams) {
    $scope.tableParams = new NgTableParams({
      page: 1,
      count: 10,
      sorting: {
        createDate: 'desc'
      }
    }, {
      getData: function ($defer, params) {
        $scope.loading = true;
        CommentsCommentModel.query(BaseAPIParams({ }, params), function (logs, headers) {
          $scope.loading = false;
          $scope.logs = logs;
          $defer.resolve(logs);
          params.total(headers('x-total-count'));
        });
      }
    });

    $scope.updateItem = function(item) {
      item.$loading = true;
      var updateItem = new CommentsCommentModel({
        _id: item._id,
        ordinal: item.ordinal,
        isPublished: !!item.isPublished,
        price: item.price
      });
      updateItem.$save(function () {
        item.$loading = false;
      });
    };

    $scope.checkSpam = function(item) {
      item.$loading = true;
      item.$spam(function () {
        item.$loading = false;
      });
    };

    $scope.remove = function(item) {
      $scope.loading = true;
      item.$delete(function() {
        $scope.loading = false;

        $scope.tableParams.reload();
      })
    };
  }
}