export default
class SitesDnsRecordEditCtrl {
  /*@ngInject*/
  constructor($scope, item, $modalInstance) {
    $scope.item = item;

    $scope.types = [
      'A', 'CNAME', 'MX', 'TXT'
    ];

    $scope.saveItem = function () {
      $scope.loading = true;

      let save = item._id ? item.$save : item.$create;
      //delete item.files;
      save.call(item, (data) => {
        $scope.loading = false;
        $modalInstance.close(item);
      });
    };

    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };
  }
}