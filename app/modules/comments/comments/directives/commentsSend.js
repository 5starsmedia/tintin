export default
  /*@ngInject*/
  () => {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'views/modules/comments/directive-commentForm.html',
      scope: {
        resourceId: '@',
        collectionName: '@',
        compactMode: '@',
        onPost: '&',
        parentComment: '=',
        sort: '=',
        comments: '=',
        placeHolder: '@?'
      },
      controller: /*@ngInject*/ ($scope, $timeout, $location, CommentsCommentModel, UsersProfileSrv) => {
        $scope.isAnonymous = false;
        $scope.placeHolder = $scope.placeHolder || 'Write a comment...';
        $scope.hasParent = angular.isDefined($scope.parentComment) && angular.isDefined($scope.parentComment._id);

        UsersProfileSrv.getAccountInfo(function(info){
          $scope.account = info;
        });

        $scope.comment = {
          text: ''
        };
        $scope.isEmpty = function () {
          return !(angular.isString($scope.comment.text) && $scope.comment.text.trim().length > 0);
          //||
          //!(angular.isString($scope.comment.title) && $scope.comment.title.trim().length > 0);
        };

        $scope.isSendEnabled = function () {
          return !$scope.isEmpty();
        };

        $scope.postComment = function () {
          var self = this;
          var obj = {
            resourceId: $scope.resourceId,
            collectionName: $scope.collectionName,
            createDate: new Date().toISOString(),
            account: $scope.account,
            text: $scope.comment.text,
            isAnonymous: $scope.isAnonymous,
            isNew: true
          };
          CommentsCommentModel.prepareComment(obj, true);
          var postData = {
            resourceId: $scope.resourceId,
            collectionName: $scope.collectionName,
            account: $scope.account,
            text: $scope.comment.text,
            isAnonymous: $scope.isAnonymous
          };
          var tempCid = CommentsCommentModel.getNexCid();
          if ($scope.hasParent) {
            obj.cid = $scope.parentComment.cid + '-' + tempCid;
            obj.parentComment = $scope.parentComment;
            obj.indent = $scope.parentComment.indent + 1;
            postData['parentComment._id'] = $scope.parentComment._id;
          } else {
            obj.cid = tempCid;
            obj.indent = 0;
          }
          if ($scope.compactMode || !$scope.parentComment) {
            $scope.comments.push(obj);
          } else {
            if ($scope.collectionName === 'advices') {
              $scope.comments.push(obj);
            } else {
              var parentIdx = $scope.comments.indexOf($scope.parentComment);

              var idx = -1;
              for (var i = parentIdx, l = $scope.comments.length; i < l; i += 1) {
                if (obj.cid < $scope.comments[i].cid) {
                  idx = i;
                  break;
                }
              }
              $scope.parentComment.comments = $scope.parentComment.comments || [];
              $scope.parentComment.comments.push(obj);

              /*if (idx === -1) {
                $scope.comments.push(obj);
              } else {
                $scope.comments.splice(idx, 0, obj);
              }*/
            }
          }
          $scope.comment.text = null;
          console.info(postData);
          CommentsCommentModel.post(postData, function (data) {
            obj._id = data._id;
            if (angular.isFunction($scope.onPost)) {
              $scope.onPost();
            }
            $timeout(function () {
              obj.isNew = false;
            }, 5000);
          });
        }
      }
    };
  }