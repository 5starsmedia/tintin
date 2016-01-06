export default
class KeywordsCheckCtrl {
  /*@ngInject*/
  constructor($scope, $state, KeywordsGroupModel, BaseAPIParams, NgTableParams, $auth, KeywordsPublicationModel, NewsPostModel) {
    var payload = $auth.getPayload();

    $scope.tableParams = new NgTableParams({
      page: 1,
      count: 10,
      sorting: {
        dueDate: 'asc'
      }
    }, {
      getData: function ($defer, params) {
        $scope.loading = true;
        KeywordsPublicationModel.query(BaseAPIParams({
          //'account._id': payload._id,
          'status': ['completed', 'inprocess', 'incompleted']
        }, params), function (projects, headers) {
          $scope.loading = false;
          $scope.projects = projects;
          $defer.resolve(projects);
          params.total(headers('x-total-count'));
        });
      }
    });

    $scope.createPublication = (item) => {
      var post = new NewsPostModel(item),
        tmp = angular.copy(item);

      delete post._id;
      delete post.group;
      delete post.validation;
      delete post.text;
      delete post.urls;
      delete post.dueDate;
      delete post.uid;
      delete post.textLength;
      post.status = 1;
      post.postType = 'post';
      post.body = item.text;
      var account = post.account;
      post.$create((data) => {
        tmp.postId = data._id;
        tmp.$save(() => {
          post.account = account;
          post.$save(() => {
            $state.go('post.edit', { id: data._id });
          });
        });
      })
    }
  }
}