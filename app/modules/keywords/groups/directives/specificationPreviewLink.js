export default
  /*@ngInject*/
  ($modal, KeywordsGroupModel) => {
    return {
      restrict: 'A',
      scope: {
        'resource': '=specificationPreviewLink'
      },
      link: function(scope, element) {
        scope.$watch('resource.resourceId', (id) => {
          if (!id) {
            return;
          }

          KeywordsGroupModel.get({ _id: id }, (group) => {
            scope.group = group;

            element.click(() => {
              scope.showPreview(group);
            });
          });
        });

        scope.showPreview = (group) => {
          var modalInstance = $modal.open({
            templateUrl: 'views/modules/keywords/specifications/modal-view.html',
            windowClass: "hmodal-success",
            controller: /*@ngInject*/ ($scope, group, $modalInstance) => {
              $scope.group = group;

              $scope.addAttachment = function () {
                $modalInstance.close(item);
              };

              $scope.close = function () {
                $modalInstance.dismiss('cancel');
              };
            },
            resolve: {
              group: () => group
            }
          });
          modalInstance.result.then((data) => {

          });
        };
      }
    };
  }