export default
  /*@ngInject*/
  () => {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'views/modules/comments/directive-comments.html',
      scope: {
        resourceId: '@',
        collectionName: '@',
        compactMode: '@',
        reverse: '=',
        disablePost: '=',
        canRemove: '='
      },
      controller: /*@ngInject*/ ($scope, $sce, $log, CommentsCommentModel) => {
        var activeReplyComment = null;
        $scope.isAnonymous = false;
        $scope.comments = [];
        $scope.page = 0;

        $scope.onPost = function () {
          if (activeReplyComment) {
            activeReplyComment.replyVisible = false;
          }
        };

        function calcShowPrev() {
          $scope.showLoadPrev = $scope.totalCount > 3 && $scope.comments.length < $scope.totalCount;
        }

        $scope.reload = function () {
          var query = {
            collectionName: $scope.collectionName,
            resourceId: $scope.resourceId,
            isPublished: true,
            sort: '-createDate',
            perPage: 3000,
            page: 1
          };
          CommentsCommentModel.query(query, (data, headers) => {
            data = data.reverse();
            $scope.comments = CommentsCommentModel.prepareData(data, $scope.canRemove);
            $scope.totalCount = headers('x-total-count');
            calcShowPrev();
          });
        };

        $scope.reload();

        // load previous comments for compact mode
        $scope.loadPrevious = function () {
          var query = {
            collectionName: $scope.collectionName,
            resourceId: $scope.resourceId,
            sort: '-createDate',
            page: 1
          };
          CommentsCommentModel.query(query, (data, headers) => {
            data = data.reverse();
            CommentsCommentModel.prepareData(data, $scope.canRemove);
            $scope.comments = data;
            $scope.totalCount = headers('x-total-count');
            calcShowPrev();
          });
        };

        // load comments for standard mode
        $scope.loadNextPage = function () {
          $scope.isBusy = true;
          $scope.page += 1;
          $log.debug('[csComments]', 'Loading page', $scope.page, '...');
          CommentsCommentModel.query({
            collectionName: $scope.collectionName,
            resourceId: $scope.resourceId,
            page: $scope.page,
            perPage: 10,
            sort: 'cid',
            flags: 'no-total-count'
          }).$promise.then((data) => {
              if (data.length !== 0) {
                CommentsCommentModel.prepareData(data, $scope.canRemove);
                $log.debug('[csComments]', 'Page', $scope.page, 'loaded successfully');
                $scope.comments = $scope.comments.concat(data);
                $scope.isBusy = false;
              } else {
                if ($scope.comments.length === 0) {
                  $scope.showWarning = true;
                }
                $log.debug('[csComments]', 'No more comments');
              }
            });
        };

        $scope.toggleReply = function ($event, comment) {
          $event.preventDefault();
          comment.replyVisible = !comment.replyVisible;
          if (activeReplyComment && comment.replyVisible && activeReplyComment !== comment) {
            activeReplyComment.replyVisible = false;
          }
          activeReplyComment = comment;
        };

        $scope.removeComment = function ($event, comment) {
          $event.preventDefault();
          CommentsCommentModel.removeComment($scope.comments, comment);
        };
      }
    };
  }