export default
class KeywordsProjectsCtrl {
  /*@ngInject*/
  constructor($scope, $state, KeywordsProjectModel, BaseAPIParams, NgTableParams, $modal) {
    $scope.tableParams = new NgTableParams({
      page: 1,
      count: 10,
      sorting: {
        createDate: 'desc'
      }
    }, {
      getData: function ($defer, params) {
        $scope.loading = true;
        KeywordsProjectModel.query(BaseAPIParams({ fields: 'title,createDate' }, params), function (projects, headers) {
          $scope.loading = false;
          $scope.projects = projects;
          $defer.resolve(projects);
          params.total(headers('x-total-count'));
        });
      }
    });

    $scope.$watch('file._id', (id) => {
      if (angular.isUndefined(id)) {
        return;
      }
      $state.go('^.projectEdit', { id: id });
    });

    $scope.remove = function(item) {
      $scope.loading = true;
      item.$delete(function() {
        $scope.loading = false;

        $scope.tableParams.reload();
      })
    };

    $scope.newProject = () => {
      var modalInstance = $modal.open({
        templateUrl: 'views/modules/keywords/form-project.html',
        controller: 'KeywordsProjectEditCtrl',
        resolve: {
          project: () => {
            return new KeywordsProjectModel({});
          }
        }
      });

      $scope.loading = true;
      modalInstance.result.then(function (selectedItem) {
        $scope.loading = false;

        $scope.tableParams.reload();
      }, function () {
        $scope.loading = false;
      });
    };
  }
}