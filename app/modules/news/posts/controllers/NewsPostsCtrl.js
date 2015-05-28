export default
class NewsPostsCtrl {
  /*@ngInject*/
  constructor($scope, $window, NewsPostModel, BaseAPIParams, NgTableParams, NewsCategoryModel) {

    NewsCategoryModel.getTree({ page: 1, perPage: 100 }, (data) => {
      $scope.category = data;
    });

    $scope.tableParams = new NgTableParams({
      page: 1,
      count: 10,
      sorting: {
        createDate: 'desc'
      }
    }, {
      groupBy: function(item) {
        return item.getDate();
      },
      getData: function ($defer, params) {
        console.info(params.filter())
        $scope.loading = true;
        NewsPostModel.query(BaseAPIParams({ fields: 'title,likesCount,viewsCount,status,createDate,account,seo' }, params), function (logs, headers) {
          $scope.loading = false;
          $scope.logs = logs;
          $defer.resolve(logs);
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