export default
class KeywordsGroupsCtrl {
  /*@ngInject*/
  constructor($scope, KeywordsGroupModel, BaseAPIParams, NgTableParams, IssuesIssueModel, $modal, $q) {

    $scope.selectedItems = [];

    $scope.tableParams = new NgTableParams({
      page: 1,
      count: 100,
      sorting: {
        createDate: 'desc'
      }
    }, {
      getData: function ($defer, params) {
        $scope.loading = true;
        KeywordsGroupModel.query(BaseAPIParams({
          status: [
            'new',
            'inprocess',
            'scaned',
            'finded',
            'completed',
            'returned'
          ]
        }, params), function (groups, headers) {
          $scope.loading = false;
          $scope.groups = groups;
          $defer.resolve(groups);
          params.total(headers('x-total-count'));
        });
      }
    });

    $scope.statusList = () => {
      var defer = $q.defer();

      defer.resolve([
        { id: 'new', title: 'Новая' },
        { id: 'inprocess', title: 'На сканировании' },
        { id: 'scaned', title: 'Анализ' },
        { id: 'finded', title: 'Подготовка' },
        { id: 'completed', title: 'Готовое' },
      ]);

      return defer;
    };;

    $scope.remove = function(item) {
      $scope.loading = true;
      item.$delete(function() {
        $scope.loading = false;

        $scope.tableParams.reload();
      })
    };

    //assign
    $scope.$watch('file._id', (id) => {
      if (angular.isUndefined(id)) {
        return;
      }
      $scope.tableParams.reload();
    })


    $scope.removeBulk = (items) => {
      var defs = [];
      _.each(items, item => defs.push(item.$delete()));

      $scope.loading = true;
      $q.all(defs).then(() => {
        $scope.tableParams.reload();
      });
    };

    $scope.assign = (group) => {
      var modalInstance = $modal.open({
        templateUrl: 'views/modules/keywords/modal-attach.html',
        controller: 'KeywordsGroupAssignCtrl',
        windowClass: "hmodal-success",
        resolve: {
          group: () => angular.copy(group)
        }
      });
      modalInstance.result.then((data) => {
        $scope.tableParams.reload();
      });
    }
  }
}