export default
class KeywordsGroupsCtrl {
  /*@ngInject*/
  constructor($scope, KeywordsGroupModel, BaseAPIParams, NgTableParams, IssuesIssueModel, $modal, $q) {

    $scope.selectedItems = [];

    $scope.checkboxes = {
      'checkedAll': false,
      'items': []
    };

    $scope.$watch('checkboxes.checkedAll', function (value) {
      angular.forEach($scope.groups, function (item) {
        item.$checked = value
      });
    });

    $scope.invertChecked = () => {
      angular.forEach($scope.groups, function (item) {
        item.$checked = !item.$checked;
      });
    };

    $scope.$watch('checkboxes.items', function (values) {
      if (!$scope.groups) {
        return;
      }
      var checked = 0, unchecked = 0,
          total = $scope.groups.length;
      angular.forEach($scope.groups, function (item) {
        var isChecked = $scope.checkboxes.items.indexOf(item) != -1;
        checked += isChecked ? 1 : 0;
        unchecked += isChecked ? 0 : 1;
        item.$checked = isChecked;
      });
      if ((unchecked == 0) || (checked == 0)) {
        $scope.checkboxes.checkedAll = (checked == total);
      }
      $scope.checkboxes.checkedAny = (checked > 0);

      angular.element(document.getElementById("select_all")).prop("indeterminate", (checked != 0 && unchecked != 0));
    }, true);

    $scope.tableParams = new NgTableParams({
      page: 1,
      count: 100,
      sorting: {
        createDate: 'desc'
      }
    }, {
      getData: function ($defer, params) {
        $scope.loading = true;
        var param = BaseAPIParams({
          status: [
            'new',
            'inprocess',
            'scaned',
            'finded',
            'completed',
            'returned'
          ]
        }, params);
        if (param.status == '') {
          delete param.status;
        }
        KeywordsGroupModel.query(param, function (groups, headers) {
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