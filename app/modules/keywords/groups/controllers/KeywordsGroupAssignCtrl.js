export default
class KeywordsGroupAssignCtrl {
  /*@ngInject*/
  constructor($scope, group, $modalInstance) {
    $scope.item = group;

    $scope.saveItem = function (item) {
      item.result.authorNotes = null;
      item.status = 'assigned';
      item.$save(() => {
        $modalInstance.close(item);
      });
    };

    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };
  }
}