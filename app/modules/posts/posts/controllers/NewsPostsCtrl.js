export default
class NewsPostsCtrl {
  /*@ngInject*/
  constructor($scope, $location, $q, NewsPostModel, BaseAPIParams, NgTableParams, NewsCategoryModel, UserAccountModel, postType) {

    $scope.postType = postType;

    NewsCategoryModel.getTree({ postType: postType, page: 1, perPage: 100 }, (data) => {
      $scope.category = data;
    });

    $scope.tableParams = new NgTableParams(angular.extend({
      page: 1,
      count: 10,
      sorting: {
        createDate: 'desc'
      }
    }, $location.search()), {
      groupBy: function(item) {
        return item.getDate();
      },
      getData: function ($defer, params) {
        $location.search(params.url());

        $scope.loading = true;
        NewsPostModel.query(BaseAPIParams({
          status: [1,2,4,6],
          postType: postType,
          fields: 'title,likesCount,viewsCount,status,createDate,account,seo,createdBy,publishedDate,category'
        }, params), function (logs, headers) {
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

    $scope.users = function($column) {
      var defer = $q.defer();

      UserAccountModel.query({ page:1, perPage: 100, fields: 'title'}, function(res) {
        var data = [];
        angular.forEach(res, function(item) {
          data.push({
            id: item._id,
            title: item.title
          });
        });
        defer.resolve(data);
      });

      return defer;
    };
  }
}