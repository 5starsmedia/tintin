export default
  /*@ngInject*/
  () => {
    return {
      restrict: 'A',
      replace: false,
      scope: {
        'collectionName': '@commentsForResource',
        'resourceId': '@'
      },
      templateUrl: 'views/modules/comments/directive-commentsForResource.html',
      controller: ($scope, NgTableParams, CommentsCommentModel, BaseAPIParams) => {

        $scope.tableParams = new NgTableParams({
          page: 1,
          count: 10,
          sorting: {
            createDate: 'desc'
          }
        }, {
          getData: function ($defer, params) {
            $scope.loading = true;
            CommentsCommentModel.query(BaseAPIParams({ collectionName: $scope.collectionName, resourceId: $scope.resourceId }, params), function (logs, headers) {
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
      },
      link: (scope, element, attrs) => {

      }
    };
  }