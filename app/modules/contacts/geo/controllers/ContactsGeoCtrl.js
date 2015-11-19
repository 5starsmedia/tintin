export default
class ContactsGeoCtrl {
  /*@ngInject*/
  constructor($scope, ContactsGeoModel, NgTableParams, $modal, BaseAPIParams) {

    $scope.tableParams = new NgTableParams({
      page: 1,
      count: 10,
      sorting: {
        createDate: 'desc'
      }
    }, {
      getData: function ($defer, params) {
        $scope.loading = true;
        ContactsGeoModel.query(BaseAPIParams({}, params), function (logs, headers) {
          $scope.loading = false;
          $scope.logs = logs;
          $defer.resolve(logs);
          params.total(headers('x-total-count'));
        });
      }
    });

    $scope.updateItem = function(item) {
      item.$loading = true;
      var updateItem = new ContactsGeoModel({
        _id: item._id,
        ordinal: item.ordinal,
        isPublished: !!item.isPublished,
        price: item.price
      });
      updateItem.$save(function () {
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

    $scope.edit = function(item) {
      item = item || new ContactsGeoModel({
        location: {
          lat: 0,
          lng: 0
        }
      });
      var modalInstance = $modal.open({
        templateUrl: 'views/modules/contacts/modal-editGeo.html',
        controller: 'ContactsGeoEditCtrl',
        windowClass: "hmodal-success",
        size: 'lg',
        resolve: {
          item: () => item
        }
      });
      modalInstance.result.then(() => {
        $scope.tableParams.reload();
      });
    };
  }
}
