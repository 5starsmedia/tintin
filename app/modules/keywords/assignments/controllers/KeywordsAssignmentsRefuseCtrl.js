export default
class KeywordsAssignmentsRefuseCtrl {
  /*@ngInject*/
  constructor($scope, group, $modalInstance) {
    $scope.item = group;

    $scope.saveItem = function (item) {
      item.result.account = { _id: null, title: null };
      item.$save(() => {
        $modalInstance.close(item);
      });
    };

    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };
  }
}